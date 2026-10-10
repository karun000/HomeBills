export type Status = 'Paid' | 'Unpaid' | 'Awaiting Reading';
export type Category = 'Electricity' | 'Water' | 'Internet' | 'Gas' | 'Rent' | string;
export type Bill = { id: string; name: string; category: Category; amount: number | null; date: string; calendar?: 'bs'; status: Status; icon: string; tint: string; notes?: string; paidAt?: string; recurring?: boolean; previousReading?: number; currentReading?: number; rate?: number; units?: number; updatedAt?: number };
export const categoryMeta: Record<string, { icon: string; tint: string }> = { Electricity: { icon: 'mdi:lightning-bolt', tint: '#F5A524' }, Water: { icon: 'mdi:water', tint: '#1F6FEB' }, 'Water Bill': { icon: 'mdi:water', tint: '#1F6FEB' }, Internet: { icon: 'mdi:wifi', tint: '#1F6FEB' }, Gas: { icon: 'mdi:fire', tint: '#F25C2A' }, 'Cooking Gas': { icon: 'mdi:fire', tint: '#F25C2A' }, Rent: { icon: 'mdi:home', tint: '#7C4DFF' }, 'Garbage Bill': { icon: 'mdi:delete', tint: '#64748B' } };
export const statusStyle: Record<Status, { fg: string; bg: string }> = { Paid: { fg: '#16A37A', bg: '#DDF6EA' }, Unpaid: { fg: '#1F6FEB', bg: '#E6F0FF' }, 'Awaiting Reading': { fg: '#8B5CF6', bg: '#EEE8FF' } };
export const money = (n: number, currency = 'NPR') => `${currency === 'NPR' ? 'NPR ' : currency + ' '}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const categories: { name: string; pct: number; amount: number; color: string }[] = [];
export const reminders: { id: string; name: string; amount: number; note: string; icon: string; tint: string; noteColor: string }[] = [];
