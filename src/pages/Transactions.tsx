import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';
import clsx from 'clsx';

type TransactionFilter = 'all' | 'deposit' | 'withdrawal';

export default function Transactions() {
  const transactions = useStore(state => state.transactions);
  const jars = useStore(state => state.jars);
  const deleteTransaction = useStore(state => state.deleteTransaction);
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [jarFilter, setJarFilter] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        if (filter === 'deposit' && tx.type !== 'deposit') return false;
        if (filter === 'withdrawal' && tx.type !== 'withdrawal') return false;
        if (jarFilter !== 'all' && tx.jarId !== jarFilter) return false;
        if (search) {
          const jar = jars.find(j => j.id === tx.jarId);
          const searchLower = search.toLowerCase();
          if (!jar?.name.toLowerCase().includes(searchLower) && !tx.note?.toLowerCase().includes(searchLower) && !tx.amount.toString().includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, jarFilter, search, jars]);

  const filters: { value: TransactionFilter; label: string }[] = [
    { value: 'all', label: 'الكل' },
    { value: 'deposit', label: 'إضافات' },
    { value: 'withdrawal', label: 'سحوبات' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">المعاملات</h1>

      {transactions.length === 0 ? (
        <EmptyState icon="📊" title="لا توجد معاملات" description="عند إضافة أو سحب الأموال من الحصالات ستظهر هنا" />
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            {filters.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)} className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-colors', filter === f.value ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300')}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="input-field pr-10" />
            </div>
            <select value={jarFilter} onChange={e => setJarFilter(e.target.value)} className="input-field w-auto">
              <option value="all">كل الحصالات</option>
              {jars.map(jar => <option key={jar.id} value={jar.id}>{jar.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد معاملات تطابق البحث</div>
            ) : (
              filteredTransactions.map(tx => {
                const jar = jars.find(j => j.id === tx.jarId);
                return <TransactionItem key={tx.id} transaction={tx} jar={jar} onDelete={deleteTransaction} />;
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}