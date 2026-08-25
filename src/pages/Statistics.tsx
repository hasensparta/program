import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useJarsWithProgress } from '../utils/selectors';
import { formatCurrency } from '../utils/currency';
import { calculateMonthlySavings, calculateAverageMonthlySavings } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { TrendingUp, TrendingDown, PiggyBank, CheckCircle2, Award, Wallet } from 'lucide-react';

export default function Statistics() {
  const jars = useJarsWithProgress();
  const transactions = useStore(state => state.transactions);
  
  const stats = useMemo(() => {
    const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
    const currentTotal = jars.reduce((sum, j) => sum + j.currentAmount, 0);
    const completedCount = jars.filter(j => j.status === 'completed' || (j.type === 'fixed' && j.currentAmount >= (j.targetAmount || 0))).length;
    const avgMonthly = calculateAverageMonthlySavings(transactions);
    const largestDeposit = transactions.filter(t => t.type === 'deposit').reduce((max, t) => Math.max(max, t.amount), 0);
    const mostFundedJar = jars.reduce((best, j) => j.currentAmount > (best?.currentAmount || 0) ? j : best, jars[0]);

    return { totalDeposits, totalWithdrawals, currentTotal, completedCount, avgMonthly, largestDeposit, mostFundedJar };
  }, [jars, transactions]);

  const monthlyData = useMemo(() => calculateMonthlySavings(transactions), [transactions]);

  if (jars.length === 0 && transactions.length === 0) {
    return <EmptyState icon="📊" title="لا توجد إحصائيات" description="ابدأ بإنشاء حصالة وإضافة الأموال لرؤية الإحصائيات هنا" actionLabel="إنشاء حصالة" actionPath="/jars/new" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">الإحصائيات</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="إجمالي الحالي" value={formatCurrency(stats.currentTotal)} icon={<Wallet className="w-5 h-5" />} color="#059669" />
        <StatCard label="إجمالي الإضافات" value={formatCurrency(stats.totalDeposits)} icon={<TrendingUp className="w-5 h-5" />} color="#3b82f6" />
        <StatCard label="إجمالي السحوبات" value={formatCurrency(stats.totalWithdrawals)} icon={<TrendingDown className="w-5 h-5" />} color="#ef4444" />
        <StatCard label="عدد الحصالات" value={`${jars.length}`} icon={<PiggyBank className="w-5 h-5" />} color="#8b5cf6" />
        <StatCard label="أهداف مكتملة" value={`${stats.completedCount}`} icon={<CheckCircle2 className="w-5 h-5" />} color="#10b981" />
        <StatCard label="متوسط شهري" value={formatCurrency(Math.round(stats.avgMonthly))} icon={<Award className="w-5 h-5" />} color="#f59e0b" />
      </div>

      {monthlyData.length > 0 && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">الادخار الشهري</h3>
          <div dir="ltr" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">💎 أكبر عملية ادخار</h4>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.largestDeposit > 0 ? formatCurrency(stats.largestDeposit) : 'لا توجد'}</p>
        </div>
        <div className="card p-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">🏆 أكثر حصالة تمويلًا</h4>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.mostFundedJar ? `${stats.mostFundedJar.name} — ${formatCurrency(stats.mostFundedJar.currentAmount)}` : 'لا توجد'}</p>
        </div>
      </div>
    </div>
  );
}