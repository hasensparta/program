import type { AchievementType, Transaction, JarWithProgress } from '../types';
import { db, generateId } from '../db/database';

export const checkAchievements = async (
  transactions: Transaction[],
  jars: JarWithProgress[]
): Promise<AchievementType[]> => {
  const newAchievements: AchievementType[] = [];
  const existing = await db.achievements.toArray();
  const existingTypes = new Set(existing.map(a => a.type));

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDepositCount = transactions.filter(t => t.type === 'deposit').length;
  const completedGoals = jars.filter(j => j.type === 'fixed' && j.currentAmount >= (j.targetAmount || 0)).length;

  const checkAndAdd = (type: AchievementType) => {
    if (!existingTypes.has(type)) {
      newAchievements.push(type);
    }
  };

  if (totalDeposits >= 100000) checkAndAdd('first_100k');
  if (totalDeposits >= 500000) checkAndAdd('first_500k');
  if (totalDeposits >= 1000000) checkAndAdd('first_million');
  if (completedGoals >= 1) checkAndAdd('first_goal_completed');
  if (totalDepositCount >= 10) checkAndAdd('ten_deposits');

  const weeklyDeposits: Set<string> = new Set();
  transactions
    .filter(t => t.type === 'deposit')
    .forEach(t => {
      const date = new Date(t.date);
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + 6 - date.getDay()) / 7)}`;
      weeklyDeposits.add(weekKey);
    });
  if (weeklyDeposits.size >= 4) checkAndAdd('consistent_4_weeks');

  for (const type of newAchievements) {
    await db.achievements.add({
      id: generateId(),
      type,
      achievedAt: new Date().toISOString(),
    });
  }

  return newAchievements;
};

export const getAchievementInfo = (type: AchievementType): { title: string; description: string; icon: string } => {
  const info: Record<AchievementType, { title: string; description: string; icon: string }> = {
    'first_100k': { title: 'أول 100,000 د.ع', description: 'جمعت أول 100,000 دينار عراقي', icon: '🎯' },
    'first_500k': { title: 'أول 500,000 د.ع', description: 'جمعت أول 500,000 دينار عراقي', icon: '💪' },
    'first_million': { title: 'أول مليون', description: 'جمعت أول مليون دينار عراقي', icon: '🌟' },
    'first_goal_completed': { title: 'أول هدف مكتمل', description: 'أكملت أول هدف ادخاري لك', icon: '🏆' },
    'ten_deposits': { title: '10 عمليات ادخار', description: 'أنجزت 10 عمليات إيداع', icon: '📈' },
    'consistent_4_weeks': { title: '4 أسابيع متتالية', description: 'واظبت على الادخار لمدة 4 أسابيع', icon: '🔥' },
  };
  return info[type];
};