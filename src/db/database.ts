import Dexie, { Table } from 'dexie';
import type { Jar, Transaction, SavingPlan, Achievement } from '../types';

export class HassalaDatabase extends Dexie {
  jars!: Table<Jar, string>;
  transactions!: Table<Transaction, string>;
  savingPlans!: Table<SavingPlan, string>;
  achievements!: Table<Achievement, string>;

  constructor() {
    super('hassala-db');
    this.version(1).stores({
      jars: 'id, status, type, createdAt, updatedAt',
      transactions: 'id, jarId, type, date, createdAt, splitGroupId',
      savingPlans: 'id, jarId, active, frequency, createdAt',
      achievements: 'id, type, achievedAt',
    });
  }
}

export const db = new HassalaDatabase();

export const generateId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};