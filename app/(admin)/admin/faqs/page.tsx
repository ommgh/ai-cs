"use client"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type FAQ = { id: string; question: string; answer: string }
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function FAQPage() {
  const { data, mutate } = useSWR<{ faqs: FAQ[] }>("/api/faqs", fetcher)
  const [q, setQ] = useState("")
  const [a, setA] = useState("")

  async function createFAQ() {
    if (!q.trim() || !a.trim()) return
    await fetch("/api/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, answer: a }),
    })
    setQ("")
    setA("")
    mutate()
  }

  async function deleteFAQ(id: string) {
    await fetch("/api/faqs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">FAQ Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Question" value={q} onChange={(e) => setQ(e.target.value)} />
          <Textarea placeholder="Answer" value={a} onChange={(e) => setA(e.target.value)} />
          <Button onClick={createFAQ}>Add</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>All FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!data?.faqs?.length && <p className="text-sm text-muted-foreground">No FAQs yet.</p>}
          {data?.faqs?.map((f) => (
            <div key={f.id} className="border rounded-md p-3">
              <div className="font-medium">{f.question}</div>
              <div className="text-sm text-muted-foreground">{f.answer}</div>
              <div className="pt-2">
                <Button variant="destructive" onClick={() => deleteFAQ(f.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
