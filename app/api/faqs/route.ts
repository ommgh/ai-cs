import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/store"

export async function GET() {
  return NextResponse.json({ faqs: db.listFaqs() })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { question, answer } = body as { question?: string; answer?: string }
  if (!question || !answer) return NextResponse.json({ error: "Invalid" }, { status: 400 })
  const created = db.createFaq({ question, answer })
  return NextResponse.json({ faq: created })
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { id, question, answer } = body as { id?: string; question?: string; answer?: string }
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const updated = db.updateFaq(id, { question, answer })
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ faq: updated })
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { id } = body as { id?: string }
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const ok = db.deleteFaq(id)
  return NextResponse.json({ ok })
}
