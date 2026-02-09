import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_USER = "beharry"
const ADMIN_PASS = "albenkata77"
const SESSION_COOKIE = "beharry_admin_session"
const SESSION_TOKEN = "bh_admin_" + Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString("base64")

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password } = body

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, SESSION_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: "Грешно потребителско име или парола" }, { status: 401 })
}

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)

  if (session?.value === SESSION_TOKEN) {
    return NextResponse.json({ authenticated: true })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ success: true })
}
