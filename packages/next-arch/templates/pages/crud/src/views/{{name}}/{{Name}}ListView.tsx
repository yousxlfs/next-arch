import { {{Name}}List } from '@/features/{{name}}';

export function {{Name}}ListView() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-3xl font-semibold">{{Name}} list</h1>
      <{{Name}}List />
    </main>
  );
}

export function {{Name}}DetailView() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-semibold">{{Name}} details</h1>
    </main>
  );
}

export function {{Name}}CreateView() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-3xl font-semibold">Create {{name}}</h1>
    </main>
  );
}
