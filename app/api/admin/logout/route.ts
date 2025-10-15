import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const url = new URL("/", request.url)
  const res = NextResponse.redirect(url, 303)
  res.cookies.set("admin_auth", "", { httpOnly: true, path: "/", maxAge: 0 })
  return res
}
