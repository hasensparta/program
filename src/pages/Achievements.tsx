import { useStore } from '../store/useStore';
import { getAchievementInfo } from '../utils/achievements';
import type { AchievementType } from '../types';
import EmptyState from '../components/EmptyState';
import clsx from 'clsx';

const allAchievements: AchievementType[] = ['first_100k', 'first_500k', 'first_million', 'first_goal_completed', 'ten_deposits', 'consistent_4_weeks'];

export default function Achievements() {
  const achievements = useStore(state => state.achievements);
  const achievedTypes = new Set(achievements.map(a => a.type));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">الإنجازات</h1>

      {achievements.length === 0 ? (
        <EmptyState icon="🏆" title="لا توجد إنجازات بعد" description="استمر في الادخار وستحصل على إنجازات مذهلة" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allAchievements.map(type => {
            const info = getAchievementInfo(type);
            const achieved = achievedTypes.has(type);
            const achievementData = achievements.find(a => a.type === type);
            return (
              <div key={type} className={clsx('card p-4 flex items-center gap-4', !achieved && 'opacity-50')}>
                <div className="text-4xl">{achieved ? info.icon : '🔒'}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{info.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{info.description}</p>
                  {achievementData && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">تم في {new Date(achievementData.achievedAt).toLocaleDateString('ar-IQ', { dateStyle: 'medium' })}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}