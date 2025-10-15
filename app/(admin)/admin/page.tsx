import { db } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartAreaInteractive } from "@/components/chart-section";

export default function AdminOverviewPage() {
  const a = db.computeAnalytics();
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {a.totalSessions}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Escalated</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {a.escalated}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolved</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{a.resolved}</CardContent>
        </Card>
      </div>
      <ChartAreaInteractive />
    </main>
  );
}
