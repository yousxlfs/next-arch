export function {{Name}}Card({ item }: { item: { id: string } }) {
  return (
    <article className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">Entity: {{name}}</p>
      <p className="font-medium">{item.id}</p>
    </article>
  );
}
