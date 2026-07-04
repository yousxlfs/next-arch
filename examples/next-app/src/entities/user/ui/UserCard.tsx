import type { User } from '../model/types';

export function UserCard({ user }: { user: User }) {
  return (
    <article className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">User entity</p>
      <p className="font-medium">{user.name}</p>
    </article>
  );
}
