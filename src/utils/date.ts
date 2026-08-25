import { format, differenceInDays, differenceInMonths, differenceInWeeks, addMonths, addWeeks, addDays, parseISO, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: ar });
};

export const formatDateLong = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMMM yyyy', { locale: ar });
};

export const formatRelativeDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { locale: ar, addSuffix: true });
};

export const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDaysUntilTarget = (targetDate: string): number => {
  const today = new Date();
  const target = parseISO(targetDate);
  return Math.max(0, differenceInDays(target, today));
};

export const getMonthsUntilTarget = (targetDate: string): number => {
  const today = new Date();
  const target = parseISO(targetDate);
  return Math.max(0, differenceInMonths(target, today));
};

export const getWeeksUntilTarget = (targetDate: string): number => {
  const today = new Date();
  const target = parseISO(targetDate);
  return Math.max(0, differenceInWeeks(target, today));
};