"use client"

import useSWR from "swr"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Settings = { tone: "concise" | "friendly" | "professional"; length: "short" | "medium" | "long" }

export default function SettingsPage() {
  const { data, mutate } = useSWR<{ settings: Settings }>("/api/settings", (url) => fetch(url).then((r) => r.json()))
  const [tone, setTone] = useState<Settings["tone"]>("professional")
  const [length, setLength] = useState<Settings["length"]>("short")

  useEffect(() => {
    if (data?.settings) {
      setTone(data.settings.tone)
      setLength(data.settings.length)
    }
  }, [data])

  async function save() {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tone, length }),
    })
    mutate()
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Response Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Settings["tone"])}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Length</Label>
            <Select value={length} onValueChange={(v) => setLength(v as Settings["length"])}>
              <SelectTrigger>
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={save}>Save</Button>
        </CardContent>
      </Card>
    </main>
  )
}
