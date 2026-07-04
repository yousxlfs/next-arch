export function ProfileCard({ name, email }: { name: string; email: string }) {
  return (
    <section className="rounded-xl border p-6">
      <h1 className="text-2xl font-semibold">{name}</h1>
      <p className="text-muted-foreground">{email}</p>
    </section>
  );
}
