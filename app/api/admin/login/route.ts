import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/store"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}))
  if (!email || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
  const ok = db.validateAdmin(String(email), String(password))
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const res = NextResponse.json({ ok: true })
  // demo cookie, not secure for production
  res.cookies.set("admin_auth", "true", { httpOnly: true, path: "/", maxAge: 60 * 60 * 8 })
  return res
}
