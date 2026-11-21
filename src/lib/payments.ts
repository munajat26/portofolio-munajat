import type { PaymentAccount, PaymentKind } from '@/types';

export const KIND_LABEL: Record<PaymentKind, string> = { bank: 'Bank', ewallet: 'E-Wallet', qris: 'QRIS' };

/** Tampilkan nomor per 4 karakter, mis. 5384254780 -> 5384 2547 80 */
export function groupNumber(n: string) {
  const clean = n.replace(/\s+/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/** Nilai yang disalin: tanpa spasi, supaya langsung bisa ditempel di aplikasi bank */
export function copyValue(n: string) {
  return n.replace(/\s+/g, '');
}

/** Cadangan jika tabel payment_accounts belum dibuat / Supabase belum dikonfigurasi */
export const DEFAULT_PAYMENTS: PaymentAccount[] = [
  { id: 'd1', kind: 'bank', name: 'BANK BSI', label: 'BISNIS', account_number: '5384254780', holder: 'MUNAJAT SIRRI', image_url: null, sort_order: 1, is_published: true, created_at: '' },
  { id: 'd2', kind: 'ewallet', name: 'GoPay', label: 'E-WALLET', account_number: '082256354006', holder: 'MUNAJAT SIRRI', image_url: null, sort_order: 2, is_published: true, created_at: '' },
  { id: 'd3', kind: 'ewallet', name: 'ShopeePay', label: 'MERCHANT', account_number: '082255679676', holder: 'MUNAJAT SIRRI', image_url: null, sort_order: 3, is_published: true, created_at: '' },
  { id: 'd4', kind: 'ewallet', name: 'ShopeePay', label: 'E-WALLET', account_number: '087786943187', holder: 'MUNAJAT SIRRI', image_url: null, sort_order: 4, is_published: true, created_at: '' },
  { id: 'd5', kind: 'qris', name: 'QRIS All Payment', label: 'QRIS', account_number: 'ID1026632010975', holder: 'MUNAJAT SIRRI', image_url: null, sort_order: 5, is_published: true, created_at: '' },
];
