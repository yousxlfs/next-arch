'use client';

import { useState } from 'react';
import { registerAction } from '../actions/register.action';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void registerAction({ name, email, password });
      }}
    >
      <input
        className="rounded border px-3 py-2"
        placeholder="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="rounded border px-3 py-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="rounded border px-3 py-2"
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
        Зарегистрироваться
      </button>
    </form>
  );
}
