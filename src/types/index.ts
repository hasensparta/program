export type JarType = 'fixed' | 'open';
export type JarStatus = 'active' | 'completed' | 'archived';
export type TransactionType = 'deposit' | 'withdrawal';
export type Frequency = 'daily' | 'weekly' | 'monthly';
export type IncomeSource = 'salary' | 'extra_work' | 'sales' | 'gift' | 'refund' | 'other';

export interface Jar {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  targetAmount?: number;
  startDate: string;
  targetDate?: string;
  type: JarType;
  status: JarStatus;
  createdAt: string;
  updatedAt: string;
  isEmergencyFund?: boolean;
}

export interface Transaction {
  id: string;
  jarId: string;
  type: TransactionType;
  amount: number;
  date: string;
  source?: IncomeSource;
  note?: string;
  createdAt: string;
  splitGroupId?: string;
}

export interface SavingPlan {
  id: string;
  jarId: string;
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
  active: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  achievedAt: string;
}

export type AchievementType =
  | 'first_100k'
  | 'first_500k'
  | 'first_million'
  | 'first_goal_completed'
  | 'ten_deposits'
  | 'consistent_4_weeks';

export interface JarWithProgress extends Jar {
  currentAmount: number;
  remainingAmount: number;
  progressPercent: number;
  isOverTarget: boolean;
}

export interface SplitTransaction {
  jarId: string;
  amount: number;
}

export interface Settings {
  currency: string;
  language: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
}

export interface ImportData {
  jars: Jar[];
  transactions: Transaction[];
  savingPlans: SavingPlan[];
  achievements: Achievement[];
  exportedAt: string;
  version: string;
}