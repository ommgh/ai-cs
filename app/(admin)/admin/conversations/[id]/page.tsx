import { notFound } from "next/navigation"
import { db } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"

export default function ConversationDetail({ params }: { params: { id: string } }) {
  const session = db.getSession(params.id)
  if (!session) return notFound()
  const msgs = db.getMessagesBySession(session.id)

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Conversation {session.id.slice(0, 6)}</h1>
      <Card>
        <CardContent className="p-4 space-y-3">
          {msgs.length === 0 && <p className="text-sm text-muted-foreground">No messages.</p>}
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-md px-3 py-2 max-w-[80%] text-sm ${
                  m.sender === "user"
                    ? "bg-blue-100 text-blue-900"
                    : m.sender === "human"
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-muted text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
