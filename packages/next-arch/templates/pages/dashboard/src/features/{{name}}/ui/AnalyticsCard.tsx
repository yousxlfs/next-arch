export function AnalyticsCard({ title, value }: { title: string; value: string }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </section>
  );
}
