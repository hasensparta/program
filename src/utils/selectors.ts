import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { calculateJarProgress, calculateTotalSavings } from './calculations';
import type { JarWithProgress } from '../types';

export const useJarsWithProgress = (): JarWithProgress[] => {
  const jars = useStore(state => state.jars);
  const transactions = useStore(state => state.transactions);
  
  return useMemo(() => {
    return jars.map(jar => calculateJarProgress(jar, transactions));
  }, [jars, transactions]);
};

export const useTotalSavings = (): number => {
  const jarsWithProgress = useJarsWithProgress();
  return useMemo(() => calculateTotalSavings(jarsWithProgress), [jarsWithProgress]);
};

export const useJarById = (id: string): JarWithProgress | undefined => {
  const jarsWithProgress = useJarsWithProgress();
  return useMemo(() => jarsWithProgress.find(j => j.id === id), [jarsWithProgress, id]);
};

export const useActiveJars = (): JarWithProgress[] => {
  const jars = useJarsWithProgress();
  return useMemo(() => jars.filter(j => j.status === 'active'), [jars]);
};

export const useCompletedJars = (): JarWithProgress[] => {
  const jars = useJarsWithProgress();
  return useMemo(() => jars.filter(j => j.status === 'completed'), [jars]);
};