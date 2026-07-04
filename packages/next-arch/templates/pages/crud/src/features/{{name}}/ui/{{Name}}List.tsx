import { {{Name}}Card } from './{{Name}}Card';

const items = [{ id: '1', title: 'Demo item' }];

export function {{Name}}List() {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <{{Name}}Card title={item.title} />
        </li>
      ))}
    </ul>
  );
}
