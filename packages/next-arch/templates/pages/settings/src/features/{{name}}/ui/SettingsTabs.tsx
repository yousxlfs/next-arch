'use client';

const tabs = ['Account', 'Notifications', 'Security'] as const;

export function SettingsTabs() {
  return (
    <div className="space-y-4">
      <nav className="flex gap-2">
        {tabs.map((tab) => (
          <button key={tab} type="button" className="rounded border px-3 py-1 text-sm">
            {tab}
          </button>
        ))}
      </nav>
      <p className="text-muted-foreground">Выбери вкладку и добавь формы в features/{{name}}/.</p>
    </div>
  );
}
