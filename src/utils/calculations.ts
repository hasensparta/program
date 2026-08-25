import type { Jar, Transaction, JarWithProgress } from '../types';
import { getMonthsUntilTarget, getWeeksUntilTarget, getDaysUntilTarget } from './date';

export const calculateJarProgress = (jar: Jar, transactions: Transaction[]): JarWithProgress => {
  const jarTransactions = transactions.filter(t => t.jarId === jar.id);
  const totalDeposits = jarTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = jarTransactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const currentAmount = totalDeposits - totalWithdrawals;
  
  if (jar.type === 'open' || !jar.targetAmount) {
    return {
      ...jar,
      currentAmount,
      remainingAmount: 0,
      progressPercent: 0,
      isOverTarget: false,
    };
  }

  const remainingAmount = Math.max(0, jar.targetAmount - currentAmount);
  const progressPercent = Math.min(100, (currentAmount / jar.targetAmount) * 100);
  const isOverTarget = currentAmount > jar.targetAmount;

  return {
    ...jar,
    currentAmount,
    remainingAmount,
    progressPercent,
    isOverTarget,
  };
};

export const calculateRequiredSavings = (
  targetAmount: number,
  currentAmount: number,
  targetDate: string
): { monthly: number; weekly: number; daily: number; remaining: number } => {
  const remaining = Math.max(0, targetAmount - currentAmount);
  const months = getMonthsUntilTarget(targetDate);
  const weeks = getWeeksUntilTarget(targetDate);
  const days = getDaysUntilTarget(targetDate);

  return {
    remaining,
    monthly: months > 0 ? remaining / months : remaining,
    weekly: weeks > 0 ? remaining / weeks : remaining,
    daily: days > 0 ? remaining / days : remaining,
  };
};

export const calculateMonthlySavings = (transactions: Transaction[]): { month: string; amount: number }[] => {
  const monthlyData: Record<string, number> = {};
  
  transactions
    .filter(t => t.type === 'deposit')
    .forEach(t => {
      const monthKey = t.date.substring(0, 7);
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + t.amount;
    });

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => {
      const [year, monthNum] = month.split('-');
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      return {
        month: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
        amount,
      };
    });
};

export const calculateAverageMonthlySavings = (transactions: Transaction[]): number => {
  const deposits = transactions.filter(t => t.type === 'deposit');
  if (deposits.length === 0) return 0;

  const months = new Set(deposits.map(t => t.date.substring(0, 7)));
  const total = deposits.reduce((sum, t) => sum + t.amount, 0);
  return months.size > 0 ? total / months.size : 0;
};

export const calculateTotalSavings = (jars: JarWithProgress[]): number => {
  return jars.reduce((sum, jar) => sum + jar.currentAmount, 0);
};

export const isJarCompleted = (jar: JarWithProgress): boolean => {
  return jar.type === 'fixed' && jar.targetAmount !== undefined && jar.currentAmount >= jar.targetAmount;
};

export const getPlanStatus = (
  jar: JarWithProgress,
  transactions: Transaction[]
): { status: 'ahead' | 'behind' | 'on_track' | 'none'; diff: number } => {
  if (!jar.targetDate || jar.type === 'open' || !jar.targetAmount) {
    return { status: 'none', diff: 0 };
  }

  const required = calculateRequiredSavings(jar.targetAmount, jar.currentAmount, jar.targetDate);
  const now = new Date();
  const startDate = new Date(jar.startDate);
  const totalDays = getDaysUntilTarget(jar.targetDate) + 
    Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (elapsedDays <= 0) return { status: 'none', diff: 0 };
  
  const expectedProgress = (elapsedDays / totalDays) * jar.targetAmount;
  const diff = jar.currentAmount - expectedProgress;

  if (Math.abs(diff) < jar.targetAmount * 0.02) {
    return { status: 'on_track', diff: 0 };
  }
  return diff >= 0 ? { status: 'ahead', diff: Math.abs(diff) } : { status: 'behind', diff: Math.abs(diff) };
};