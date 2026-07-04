export async function fetchDemo(): Promise<{ message: string }> {
  return { message: 'Loaded from features/demo/api' };
}
