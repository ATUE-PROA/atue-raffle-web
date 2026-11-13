interface Env {
  DB: D1Database
  ADMIN_KEY: string
  ALLOWED_ORIGIN?: string
}

const TOTAL_NUMBERS = 500
const PRIZE_COUNT = 1
const PRICE_SINGLE = 3
const BUNDLE_SIZE = 5
const BUNDLE_PRICE = 12
const MAX_NAME = 120
const MAX_PHONE = 20
const MAX_INDICATION = 120

type Status = 'pending' | 'paid' | 'cancelled'

interface ReservationRow {
  id: string
  customer_name: string
  customer_phone: string
  indication: string
  numbers: string
  total_amount: number
  status: Status
  created_at: string
  confirmed_at: string | null
}

interface OccupiedRow {
  number: number
  status: Status
  customer_name: string
}

interface WinnerRow {
  position: number
  number: number
  customer_name: string
}

interface ReservationBody {
  customerName?: unknown
  customerPhone?: unknown
  indication?: unknown
  numbers?: unknown
}

function corsHeaders(env: Env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN ?? '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,x-admin-key',
  }
}

function json(env: Env, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(env) },
  })
}

function isAdmin(request: Request, env: Env) {
  return Boolean(env.ADMIN_KEY) && request.headers.get('x-admin-key') === env.ADMIN_KEY
}

function parseNumbers(value: string): number[] {
  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is number => Number.isInteger(item))
  } catch {
    return []
  }
}

function calculateTotal(count: number) {
  const bundles = Math.floor(count / BUNDLE_SIZE)
  const remaining = count % BUNDLE_SIZE
  return bundles * BUNDLE_PRICE + remaining * PRICE_SINGLE
}

function toReservation(row: ReservationRow) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    indication: row.indication,
    numbers: parseNumbers(row.numbers),
    totalAmount: Number(row.total_amount),
    status: row.status,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
  }
}

async function loadSnapshot(env: Env) {
  const occupied = await env.DB.prepare(
    `SELECT n.number, r.status, r.customer_name
       FROM reservation_numbers n
       JOIN reservations r ON r.id = n.reservation_id
      WHERE r.status IN ('pending', 'paid')
      ORDER BY n.number`,
  ).all<OccupiedRow>()

  const totals = await env.DB.prepare(
    `SELECT status, total_amount, numbers
       FROM reservations
      WHERE status IN ('pending', 'paid')`,
  ).all<Pick<ReservationRow, 'status' | 'total_amount' | 'numbers'>>()

  const settings = await env.DB.prepare('SELECT closed FROM raffle_settings WHERE id = 1').first<{
    closed: number
  }>()

  const winners = await env.DB.prepare(
    'SELECT position, number, customer_name FROM winners ORDER BY position',
  ).all<WinnerRow>()

  let pending = 0
  let paid = 0
  let revenue = 0

  for (const row of totals.results) {
    const count = parseNumbers(row.numbers).length
    if (row.status === 'pending') {
      pending += count
    } else if (row.status === 'paid') {
      paid += count
      revenue += Number(row.total_amount)
    }
  }

  return {
    closed: Boolean(settings?.closed),
    winners: winners.results.map((winner) => ({
      position: winner.position,
      number: winner.number,
      customerName: winner.customer_name,
    })),
    occupied: occupied.results.map((row) => ({
      number: row.number,
      status: row.status,
      customerName: row.customer_name,
    })),
    stats: {
      total: TOTAL_NUMBERS,
      available: Math.max(0, TOTAL_NUMBERS - pending - paid),
      pending,
      paid,
      revenue,
    },
  }
}

function validateBody(body: ReservationBody) {
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : ''
  const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : ''
  const indication = typeof body.indication === 'string' ? body.indication.trim() : ''

  if (customerName.length < 2 || customerName.length > MAX_NAME) {
    return { error: 'Informe um nome válido.' } as const
  }
  if (customerPhone.replace(/\D/g, '').length < 10 || customerPhone.length > MAX_PHONE) {
    return { error: 'Informe um WhatsApp válido com DDD.' } as const
  }
  if (indication.length > MAX_INDICATION) {
    return { error: 'Indicação muito longa.' } as const
  }
  if (!Array.isArray(body.numbers)) {
    return { error: 'Selecione pelo menos um número.' } as const
  }

  const numbers = [...new Set(body.numbers)].sort((a, b) => a - b)
  if (
    numbers.length === 0 ||
    numbers.some(
      (number) => !Number.isInteger(number) || number < 1 || number > TOTAL_NUMBERS,
    )
  ) {
    return { error: 'Selecione números válidos.' } as const
  }

  return { customerName, customerPhone, indication, numbers } as const
}

async function createReservation(request: Request, env: Env) {
  const body = (await request.json().catch(() => null)) as ReservationBody | null
  if (!body) return json(env, { error: 'Corpo inválido.' }, 400)

  const parsed = validateBody(body)
  if ('error' in parsed) return json(env, { error: parsed.error }, 400)

  const { customerName, customerPhone, indication, numbers } = parsed
  const placeholders = numbers.map(() => '?').join(',')

  const conflicts = await env.DB.prepare(
    `SELECT n.number
       FROM reservation_numbers n
       JOIN reservations r ON r.id = n.reservation_id
      WHERE r.status IN ('pending', 'paid') AND n.number IN (${placeholders})`,
  )
    .bind(...numbers)
    .all<{ number: number }>()

  if (conflicts.results.length > 0) {
    const unavailable = conflicts.results.map((row) => row.number).join(', ')
    return json(env, { error: `Números indisponíveis: ${unavailable}.` }, 409)
  }

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const totalAmount = calculateTotal(numbers.length)

  try {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO reservations
           (id, customer_name, customer_phone, indication, numbers, total_amount, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      ).bind(
        id,
        customerName,
        customerPhone,
        indication,
        JSON.stringify(numbers),
        totalAmount,
        createdAt,
      ),
      ...numbers.map((number) =>
        env.DB.prepare('INSERT INTO reservation_numbers (number, reservation_id) VALUES (?, ?)').bind(
          number,
          id,
        ),
      ),
    ])
  } catch {
    return json(env, { error: 'Alguns números foram reservados agora há pouco. Escolha outros.' }, 409)
  }

  return json(
    env,
    {
      reservation: {
        id,
        customerName,
        customerPhone,
        indication,
        numbers,
        totalAmount,
        status: 'pending',
        createdAt,
        confirmedAt: null,
      },
    },
    201,
  )
}

async function getReservation(env: Env, id: string) {
  const row = await env.DB.prepare('SELECT * FROM reservations WHERE id = ?')
    .bind(id)
    .first<ReservationRow>()

  if (!row) return json(env, { error: 'Reserva não encontrada.' }, 404)
  return json(env, { reservation: toReservation(row) })
}

async function loadAdminData(env: Env) {
  const rows = await env.DB.prepare('SELECT * FROM reservations ORDER BY created_at DESC').all<
    ReservationRow
  >()
  const snapshot = await loadSnapshot(env)
  return json(env, {
    ...snapshot,
    reservations: rows.results.map(toReservation),
  })
}

async function confirmPayment(env: Env, id: string) {
  const result = await env.DB.prepare(
    `UPDATE reservations
        SET status = 'paid', confirmed_at = ?
      WHERE id = ? AND status = 'pending'`,
  )
    .bind(new Date().toISOString(), id)
    .run()

  if ((result.meta.changes ?? 0) === 0) {
    return json(env, { error: 'Reserva não encontrada ou já processada.' }, 404)
  }
  return json(env, { ok: true })
}

async function cancelReservation(env: Env, id: string) {
  await env.DB.batch([
    env.DB.prepare(`UPDATE reservations SET status = 'cancelled' WHERE id = ?`).bind(id),
    env.DB.prepare('DELETE FROM reservation_numbers WHERE reservation_id = ?').bind(id),
  ])
  return json(env, { ok: true })
}

async function closeRaffle(env: Env) {
  const paid = await env.DB.prepare(
    `SELECT customer_name, numbers FROM reservations WHERE status = 'paid'`,
  ).all<Pick<ReservationRow, 'customer_name' | 'numbers'>>()

  const entries = paid.results.flatMap((row) =>
    parseNumbers(row.numbers).map((number) => ({ number, customerName: row.customer_name })),
  )

  for (let index = entries.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[entries[index], entries[swap]] = [entries[swap], entries[index]]
  }

  const winners: { position: number; number: number; customerName: string }[] = []
  const usedNames = new Set<string>()

  for (const entry of entries) {
    if (winners.length >= PRIZE_COUNT) break
    const nameKey = entry.customerName.trim().toLowerCase()
    if (usedNames.has(nameKey)) continue
    usedNames.add(nameKey)
    winners.push({
      position: winners.length + 1,
      number: entry.number,
      customerName: entry.customerName,
    })
  }

  if (winners.length === 0) {
    return json(env, { error: 'É preciso ter ao menos um número pago para sortear.' }, 400)
  }

  await env.DB.batch([
    env.DB.prepare('DELETE FROM winners'),
    ...winners.map((winner) =>
      env.DB.prepare(
        'INSERT INTO winners (position, number, customer_name) VALUES (?, ?, ?)',
      ).bind(winner.position, winner.number, winner.customerName),
    ),
    env.DB.prepare('UPDATE raffle_settings SET closed = 1 WHERE id = 1'),
  ])

  return json(env, { winners })
}

async function reopenRaffle(env: Env) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM winners'),
    env.DB.prepare('UPDATE raffle_settings SET closed = 0 WHERE id = 1'),
  ])
  return json(env, { ok: true })
}

async function resetRaffle(env: Env) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM reservation_numbers'),
    env.DB.prepare('DELETE FROM reservations'),
    env.DB.prepare('DELETE FROM winners'),
    env.DB.prepare('UPDATE raffle_settings SET closed = 0 WHERE id = 1'),
  ])
  return json(env, { ok: true })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) })
    }

    const { pathname } = new URL(request.url)

    try {
      if (pathname === '/api/raffle' && request.method === 'GET') {
        return json(env, await loadSnapshot(env))
      }

      if (pathname === '/api/reservations' && request.method === 'POST') {
        return await createReservation(request, env)
      }

      const reservationMatch = pathname.match(/^\/api\/reservations\/([\w-]+)$/)
      if (reservationMatch && request.method === 'GET') {
        return await getReservation(env, reservationMatch[1])
      }

      if (pathname.startsWith('/api/admin/')) {
        if (!isAdmin(request, env)) return json(env, { error: 'Não autorizado.' }, 401)

        if (pathname === '/api/admin/data' && request.method === 'GET') {
          return await loadAdminData(env)
        }

        if (pathname === '/api/admin/close' && request.method === 'POST') {
          return await closeRaffle(env)
        }

        if (pathname === '/api/admin/reopen' && request.method === 'POST') {
          return await reopenRaffle(env)
        }

        if (pathname === '/api/admin/reset' && request.method === 'POST') {
          return await resetRaffle(env)
        }

        const actionMatch = pathname.match(
          /^\/api\/admin\/reservations\/([\w-]+)\/(confirm|cancel)$/,
        )
        if (actionMatch && request.method === 'POST') {
          const [, id, action] = actionMatch
          return action === 'confirm'
            ? await confirmPayment(env, id)
            : await cancelReservation(env, id)
        }
      }

      return json(env, { error: 'Rota não encontrada.' }, 404)
    } catch (error) {
      console.error(error)
      return json(env, { error: 'Erro interno.' }, 500)
    }
  },
}
