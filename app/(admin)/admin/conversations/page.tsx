import Link from "next/link"
import { db } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ConversationsPage() {
  const sessions = db.getSessions()
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Conversations</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
            {sessions.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">Session {s.id.slice(0, 6)}</div>
                  <div className="text-muted-foreground">Started {new Date(s.startedAt).toLocaleString()}</div>
                </div>
                <Button variant="secondary" asChild>
                  <Link href={`/admin/conversations/${s.id}`}>Open</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
