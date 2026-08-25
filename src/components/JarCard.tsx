import { useNavigate } from 'react-router-dom';
import type { JarWithProgress } from '../types';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';
import ProgressBar from './ProgressBar';

interface JarCardProps {
  jar: JarWithProgress;
}

const iconMap: Record<string, string> = {
  phone: '📱', laptop: '💻', car: '🚗', travel: '✈️', wedding: '💍',
  home: '🏠', project: '💼', emergency: '🚨', occasion: '🎉', other: '💰',
};

export default function JarCard({ jar }: JarCardProps) {
  const navigate = useNavigate();
  const icon = iconMap[jar.icon] || '💰';

  return (
    <button
      onClick={() => navigate(`/jars/${jar.id}`)}
      className="card w-full text-right p-4 hover:scale-[1.02] cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: `${jar.color}20` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{jar.name}</h3>
            {jar.status === 'completed' && (
              <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">مكتملة</span>
            )}
            {jar.status === 'archived' && (
              <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">مؤرشفة</span>
            )}
          </div>

          {jar.type === 'fixed' && jar.targetAmount !== undefined ? (
            <>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{formatCurrency(jar.currentAmount)}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">من {formatCompactCurrency(jar.targetAmount)}</span>
              </div>
              <ProgressBar progress={jar.progressPercent} color={jar.color} />
              <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {jar.isOverTarget ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    تم تجاوز الهدف بـ {formatCurrency(jar.currentAmount - jar.targetAmount)}
                  </span>
                ) : (
                  <>المتبقي: {formatCurrency(jar.remainingAmount)} ({jar.progressPercent.toFixed(1)}%)</>
                )}
              </div>
            </>
          ) : (
            <div className="mt-2">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(jar.currentAmount)}</span>
            </div>
          )}

          {jar.targetDate && jar.type === 'fixed' && (
            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              🗓️ حتى {new Date(jar.targetDate).toLocaleDateString('ar-IQ', { dateStyle: 'medium' })}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}