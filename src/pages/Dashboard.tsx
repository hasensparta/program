import { useNavigate } from 'react-router-dom';
import { Plus, PiggyBank, CheckCircle2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useJarsWithProgress, useTotalSavings, useActiveJars, useCompletedJars } from '../utils/selectors';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/currency';
import JarCard from '../components/JarCard';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { getPlanStatus } from '../utils/calculations';
import clsx from 'clsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const jars = useJarsWithProgress();
  const activeJars = useActiveJars();
  const completedJars = useCompletedJars();
  const totalSavings = useTotalSavings();
  const transactions = useStore(state => state.transactions);
  
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const planStatuses = activeJars
    .filter(j => j.targetDate && j.type === 'fixed')
    .map(jar => ({ jar, plan: getPlanStatus(jar, transactions) }))
    .filter(({ plan }) => plan.status !== 'none');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">الرئيسية</h1>
        <button onClick={() => navigate('/jars/new')} className="btn-primary">
          <Plus className="w-5 h-5" />
          حصالة جديدة
        </button>
      </div>

      {jars.length === 0 ? (
        <EmptyState
          icon="🐖"
          title="ابدأ أول حصالة لك"
          description="حدد هدفًا صغيرًا وابدأ بجمع أول مبلغ. كل دينار يقربك من هدفك."
          actionLabel="+ إنشاء حصالة"
          actionPath="/jars/new"
        />
      ) : (
        <>
          <div className="card p-6 mb-6 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100 mb-1">إجمالي الأموال في الحصالات</p>
                <p className="text-3xl font-bold">{formatCurrency(totalSavings)}</p>
              </div>
              <PiggyBank className="w-12 h-12 text-emerald-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="الحصالات" value={`${jars.length}`} icon={<PiggyBank className="w-5 h-5" />} color="#059669" />
            <StatCard label="مكتملة" value={`${completedJars.length}`} icon={<CheckCircle2 className="w-5 h-5" />} color="#10b981" />
            <StatCard label="إجمالي الإضافات" value={formatCurrency(totalDeposits)} icon={<TrendingUp className="w-5 h-5" />} color="#3b82f6" />
            <StatCard label="إجمالي السحوبات" value={formatCurrency(totalWithdrawals)} icon={<TrendingDown className="w-5 h-5" />} color="#ef4444" />
          </div>

          {planStatuses.length > 0 && (
            <div className="mb-6 space-y-2">
              {planStatuses.map(({ jar, plan }) => (
                <div
                  key={jar.id}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border',
                    plan.status === 'behind'
                      ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                      : plan.status === 'ahead'
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  )}
                >
                  <AlertCircle className={clsx('w-5 h-5 flex-shrink-0',
                    plan.status === 'behind' ? 'text-orange-500' : 'text-emerald-500'
                  )} />
                  <span className="text-sm">
                    <strong>{jar.name}:</strong>{' '}
                    {plan.status === 'behind' && `متأخر عن الخطة بـ ${formatCurrency(plan.diff)}`}
                    {plan.status === 'ahead' && `متقدم عن الخطة بـ ${formatCurrency(plan.diff)}`}
                    {plan.status === 'on_track' && 'أنت على المسار الصحيح!'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeJars.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">أهدافي</h2>
                <button onClick={() => navigate('/jars')} className="text-sm text-emerald-600 hover:text-emerald-700">عرض الكل</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeJars.map(jar => <JarCard key={jar.id} jar={jar} />)}
              </div>
            </section>
          )}

          {completedJars.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">مكتملة 🎉</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completedJars.map(jar => <JarCard key={jar.id} jar={jar} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}