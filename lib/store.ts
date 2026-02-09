// In-memory data store for reservations and vouchers
// In production, this would be backed by a database (Supabase, Neon, etc.)

export interface Reservation {
  id: string
  type: "seats" | "event"
  date: string
  time: string
  seats: number[]
  customerName: string
  customerEmail: string
  customerPhone: string
  notes: string
  status: "confirmed" | "cancelled"
  createdAt: string
}

export interface Voucher {
  id: string
  code: string
  type: "voucher" | "giftbox"
  amount: number
  recipientName: string
  senderName: string
  message: string
  buyerEmail: string
  buyerPhone: string
  status: "paid" | "used" | "expired"
  createdAt: string
}

// Seed some demo data
function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

const today = new Date()
const todayStr = today.toISOString().split("T")[0]
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
const yesterdayStr = yesterday.toISOString().split("T")[0]
const twoDaysAgo = new Date(today)
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0]
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const tomorrowStr = tomorrow.toISOString().split("T")[0]

const seedReservations: Reservation[] = [
  {
    id: generateId(),
    type: "seats",
    date: todayStr,
    time: "10:00",
    seats: [1, 2, 3, 4],
    customerName: "Мария Петрова",
    customerEmail: "maria.petrova@email.com",
    customerPhone: "+359 88 111 2233",
    notes: "Рожден ден",
    status: "confirmed",
    createdAt: twoDaysAgoStr + "T09:30:00Z",
  },
  {
    id: generateId(),
    type: "seats",
    date: todayStr,
    time: "14:00",
    seats: [9, 10, 11, 12, 21, 22],
    customerName: "Георги Иванов",
    customerEmail: "georgi.ivanov@email.com",
    customerPhone: "+359 89 222 3344",
    notes: "",
    status: "confirmed",
    createdAt: yesterdayStr + "T14:00:00Z",
  },
  {
    id: generateId(),
    type: "event",
    date: tomorrowStr,
    time: "18:00",
    seats: Array.from({ length: 42 }, (_, i) => i + 1),
    customerName: "Фирма АБВ ЕООД",
    customerEmail: "events@abv-company.bg",
    customerPhone: "+359 2 999 8877",
    notes: "Корпоративно събитие за 35 души",
    status: "confirmed",
    createdAt: twoDaysAgoStr + "T16:00:00Z",
  },
  {
    id: generateId(),
    type: "seats",
    date: todayStr,
    time: "16:00",
    seats: [5, 6, 7, 8],
    customerName: "Ана Димитрова",
    customerEmail: "ana.d@gmail.com",
    customerPhone: "+359 87 333 4455",
    notes: "Моля за детски столчета",
    status: "confirmed",
    createdAt: todayStr + "T08:00:00Z",
  },
  {
    id: generateId(),
    type: "seats",
    date: yesterdayStr,
    time: "12:00",
    seats: [13, 14, 15, 16],
    customerName: "Стефан Колев",
    customerEmail: "stefan.k@email.bg",
    customerPhone: "+359 88 555 6677",
    notes: "",
    status: "confirmed",
    createdAt: twoDaysAgoStr + "T10:00:00Z",
  },
  {
    id: generateId(),
    type: "seats",
    date: todayStr,
    time: "20:00",
    seats: [37, 38, 39, 40, 41, 42],
    customerName: "Елена Тодорова",
    customerEmail: "elena.t@yahoo.com",
    customerPhone: "+359 88 777 8899",
    notes: "Вечер с приятели",
    status: "confirmed",
    createdAt: yesterdayStr + "T20:00:00Z",
  },
  {
    id: generateId(),
    type: "seats",
    date: twoDaysAgoStr,
    time: "10:00",
    seats: [29, 30],
    customerName: "Николай Христов",
    customerEmail: "niko.h@email.com",
    customerPhone: "+359 89 111 0022",
    notes: "",
    status: "cancelled",
    createdAt: twoDaysAgoStr + "T07:00:00Z",
  },
]

const seedVouchers: Voucher[] = [
  {
    id: generateId(),
    code: "BH-A3K7M9PQ",
    type: "voucher",
    amount: 50,
    recipientName: "Десислава",
    senderName: "Кристина",
    message: "Честит рожден ден!",
    buyerEmail: "kristina@email.com",
    buyerPhone: "+359 88 111 2233",
    status: "paid",
    createdAt: yesterdayStr + "T12:00:00Z",
  },
  {
    id: generateId(),
    code: "BH-R5T2WX8N",
    type: "giftbox",
    amount: 100,
    recipientName: "Иван Стоянов",
    senderName: "Петя Стоянова",
    message: "За нашата годишнина",
    buyerEmail: "petya.s@gmail.com",
    buyerPhone: "+359 89 222 3344",
    status: "paid",
    createdAt: twoDaysAgoStr + "T15:00:00Z",
  },
  {
    id: generateId(),
    code: "BH-J6L8D4VZ",
    type: "voucher",
    amount: 80,
    recipientName: "Мартин",
    senderName: "Надя",
    message: "",
    buyerEmail: "nadya@email.bg",
    buyerPhone: "+359 87 333 4455",
    status: "used",
    createdAt: twoDaysAgoStr + "T09:00:00Z",
  },
  {
    id: generateId(),
    code: "BH-Q2F9H7YC",
    type: "voucher",
    amount: 150,
    recipientName: "",
    senderName: "Александър Попов",
    message: "Подарък за екипа",
    buyerEmail: "alex.p@company.bg",
    buyerPhone: "+359 88 555 6677",
    status: "paid",
    createdAt: todayStr + "T10:00:00Z",
  },
]

// In-memory store
let reservations: Reservation[] = [...seedReservations]
let vouchers: Voucher[] = [...seedVouchers]

export function getReservations(): Reservation[] {
  return [...reservations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getVouchers(): Voucher[] {
  return [...vouchers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addReservation(data: Omit<Reservation, "id" | "createdAt" | "status">): Reservation {
  const reservation: Reservation = {
    ...data,
    id: generateId(),
    status: "confirmed",
    createdAt: new Date().toISOString(),
  }
  reservations = [reservation, ...reservations]
  return reservation
}

export function addVoucher(data: Omit<Voucher, "id" | "createdAt" | "status">): Voucher {
  const voucher: Voucher = {
    ...data,
    id: generateId(),
    status: "paid",
    createdAt: new Date().toISOString(),
  }
  vouchers = [voucher, ...vouchers]
  return voucher
}

export function updateReservationStatus(id: string, status: Reservation["status"]): Reservation | null {
  const idx = reservations.findIndex((r) => r.id === id)
  if (idx === -1) return null
  reservations[idx] = { ...reservations[idx], status }
  return reservations[idx]
}

export function updateVoucherStatus(id: string, status: Voucher["status"]): Voucher | null {
  const idx = vouchers.findIndex((v) => v.id === id)
  if (idx === -1) return null
  vouchers[idx] = { ...vouchers[idx], status }
  return vouchers[idx]
}

export function getReservedSeatsForSlot(date: string, time: string): number[] {
  return reservations
    .filter((r) => r.date === date && r.time === time && r.status !== "cancelled")
    .flatMap((r) => r.seats)
}

export function getStats() {
  const todayRes = reservations.filter((r) => r.date === todayStr && r.status !== "cancelled")
  const todaySeats = todayRes.reduce((sum, r) => sum + r.seats.length, 0)
  const totalRevenue = vouchers.filter((v) => v.status === "paid" || v.status === "used").reduce((sum, v) => sum + v.amount, 0)
  const cancelledReservations = reservations.filter((r) => r.status === "cancelled").length
  const activeVouchers = vouchers.filter((v) => v.status === "paid").length

  return {
    todayReservations: todayRes.length,
    todaySeats,
    totalRevenue,
    cancelledReservations,
    activeVouchers,
    totalReservations: reservations.length,
    totalVouchers: vouchers.length,
  }
}
