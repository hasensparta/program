import { create } from 'zustand';
import { db } from '../db/database';
import type { Jar, Transaction, SavingPlan, Achievement, Settings } from '../types';

interface StoreState {
  jars: Jar[];
  transactions: Transaction[];
  savingPlans: SavingPlan[];
  achievements: Achievement[];
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  
  init: () => Promise<void>;
  addJar: (jar: Omit<Jar, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateJar: (id: string, updates: Partial<Jar>) => Promise<void>;
  deleteJar: (id: string) => Promise<void>;
  archiveJar: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<string>;
  deleteTransaction: (id: string) => Promise<void>;
  addSavingPlan: (plan: Omit<SavingPlan, 'id' | 'createdAt'>) => Promise<void>;
  updateSavingPlan: (id: string, updates: Partial<SavingPlan>) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<boolean>;
  clearAllData: () => Promise<void>;
}

const defaultSettings: Settings = {
  currency: 'IQD',
  language: 'ar',
  darkMode: false,
  notificationsEnabled: true,
};

export const useStore = create<StoreState>((set, get) => ({
  jars: [],
  transactions: [],
  savingPlans: [],
  achievements: [],
  settings: defaultSettings,
  isLoading: true,
  error: null,

  init: async () => {
    try {
      const [jars, transactions, savingPlans, achievements] = await Promise.all([
        db.jars.toArray(),
        db.transactions.toArray(),
        db.savingPlans.toArray(),
        db.achievements.toArray(),
      ]);
      
      const savedSettings = localStorage.getItem('hassala-settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
      
      set({ jars, transactions, savingPlans, achievements, settings, isLoading: false });
      
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      }
    } catch (err) {
      set({ error: 'فشل تحميل البيانات', isLoading: false });
    }
  },

  addJar: async (jarData) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const jar: Jar = { ...jarData, id, createdAt: now, updatedAt: now };
    await db.jars.add(jar);
    set(state => ({ jars: [...state.jars, jar] }));
    return id;
  },

  updateJar: async (id, updates) => {
    const now = new Date().toISOString();
    await db.jars.update(id, { ...updates, updatedAt: now });
    set(state => ({
      jars: state.jars.map(j => j.id === id ? { ...j, ...updates, updatedAt: now } : j),
    }));
  },

  deleteJar: async (id) => {
    await db.jars.delete(id);
    await db.transactions.where('jarId').equals(id).delete();
    await db.savingPlans.where('jarId').equals(id).delete();
    set(state => ({
      jars: state.jars.filter(j => j.id !== id),
      transactions: state.transactions.filter(t => t.jarId !== id),
      savingPlans: state.savingPlans.filter(p => p.jarId !== id),
    }));
  },

  archiveJar: async (id) => {
    const now = new Date().toISOString();
    await db.jars.update(id, { status: 'archived', updatedAt: now });
    set(state => ({
      jars: state.jars.map(j => j.id === id ? { ...j, status: 'archived' as const, updatedAt: now } : j),
    }));
  },

  addTransaction: async (txData) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const tx: Transaction = { ...txData, id, createdAt: now };
    await db.transactions.add(tx);
    set(state => ({ transactions: [...state.transactions, tx] }));
    return id;
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
  },

  addSavingPlan: async (planData) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const plan: SavingPlan = { ...planData, id, createdAt: now };
    await db.savingPlans.add(plan);
    set(state => ({ savingPlans: [...state.savingPlans, plan] }));
  },

  updateSavingPlan: async (id, updates) => {
    await db.savingPlans.update(id, updates);
    set(state => ({
      savingPlans: state.savingPlans.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  },

  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    localStorage.setItem('hassala-settings', JSON.stringify(newSettings));
    set({ settings: newSettings });
    
    if (updates.darkMode !== undefined) {
      if (updates.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  exportData: async () => {
    const state = get();
    const data = {
      jars: state.jars,
      transactions: state.transactions,
      savingPlans: state.savingPlans,
      achievements: state.achievements,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importData: async (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!data.jars || !data.transactions || !data.version) {
        return false;
      }
      
      await db.jars.clear();
      await db.transactions.clear();
      await db.savingPlans.clear();
      await db.achievements.clear();
      
      await db.jars.bulkAdd(data.jars);
      await db.transactions.bulkAdd(data.transactions);
      if (data.savingPlans) await db.savingPlans.bulkAdd(data.savingPlans);
      if (data.achievements) await db.achievements.bulkAdd(data.achievements);
      
      await get().init();
      return true;
    } catch {
      return false;
    }
  },

  clearAllData: async () => {
    await db.jars.clear();
    await db.transactions.clear();
    await db.savingPlans.clear();
    await db.achievements.clear();
    set({ jars: [], transactions: [], savingPlans: [], achievements: [] });
  },
}));