import { RecurringExpense } from '../types';

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format số có dấu phân cách hàng nghìn (dấu phẩy hoặc chấm) cho input form
 */
export function formatNumberWithCommas(val: string | number): string {
  const num = typeof val === 'number' ? val : Number(String(val).replace(/\D/g, ''));
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('en-US'); // tạo định dạng 150,000 hoặc 3,900,000
}

export function parseNumberFromCommas(val: string): number {
  const num = Number(val.replace(/\D/g, ''));
  return isNaN(num) ? 0 : num;
}

export function formatShortVND(amount: number): string {
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)} tr`;
  }
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k`;
  }
  return `${amount} đ`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function isRecurringDueInMonth(item: RecurringExpense, targetMonthKey: string): boolean {
  if (item.cycle === 'monthly') return true;
  if (!item.anchorMonth) return true;

  const [tYear, tMonth] = targetMonthKey.split('-').map(Number);
  const [aYear, aMonth] = item.anchorMonth.split('-').map(Number);

  const diffMonths = (tYear - aYear) * 12 + (tMonth - aMonth);
  if (diffMonths < 0) return false;

  if (item.cycle === 'quarterly') {
    return diffMonths % 3 === 0;
  }
  if (item.cycle === 'yearly') {
    return diffMonths % 12 === 0;
  }
  return true;
}

export function formatDueText(item: RecurringExpense): string {
  const timing = item.dueOption === 'end_of_month' ? 'Cuối tháng' : 'Đầu tháng';

  if (item.cycle === 'quarterly') {
    return `${timing} (3 tháng / lần${item.anchorMonth ? ` - mốc ${item.anchorMonth}` : ''})`;
  }
  return `${timing} hàng tháng`;
}
