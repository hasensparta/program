import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useJarsWithProgress } from '../utils/selectors';
import JarCard from '../components/JarCard';
import EmptyState from '../components/EmptyState';
import clsx from 'clsx';

type FilterType = 'all' | 'active' | 'completed' | 'archived';

export default function JarsList() {
  const navigate = useNavigate();
  const jars = useJarsWithProgress();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filteredJars = jars.filter(jar => {
    if (filter === 'active' && jar.status !== 'active') return false;
    if (filter === 'completed' && jar.status !== 'completed') return false;
    if (filter === 'archived' && jar.status !== 'archived') return false;
    if (search && !jar.name.includes(search)) return false;
    return true;
  });

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'الكل' },
    { value: 'active', label: 'نشطة' },
    { value: 'completed', label: 'مكتملة' },
    { value: 'archived', label: 'مؤرشفة' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">الحصالات</h1>
        <button onClick={() => navigate('/jars/new')} className="btn-primary">
          <Plus className="w-5 h-5" />
          حصالة جديدة
        </button>
      </div>

      {jars.length === 0 ? (
        <EmptyState icon="🏺" title="لا توجد حصالات بعد" description="أنشئ حصالتك الأولى وابدأ رحلة الادخار" actionLabel="+ إنشاء حصالة" actionPath="/jars/new" />
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  filter === f.value ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="البحث عن حصالة..."
              className="input-field pr-10"
            />
          </div>

          {filteredJars.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد حصالات تطابق معايير البحث</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredJars.map(jar => <JarCard key={jar.id} jar={jar} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}