import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Minus, Archive, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useJarById } from '../utils/selectors';
import { formatCurrency } from '../utils/currency';
import { formatDate, getTodayISO } from '../utils/date';
import { calculateRequiredSavings } from '../utils/calculations';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import TransactionItem from '../components/TransactionItem';

const iconMap: Record<string, string> = {
  phone: '📱', laptop: '💻', car: '🚗', travel: '✈️', wedding: '💍',
  home: '🏠', project: '💼', emergency: '🚨', occasion: '🎉', other: '💰',
};

const incomeSources = [
  { value: 'salary', label: 'راتب' },
  { value: 'extra_work', label: 'عمل إضافي' },
  { value: 'sales', label: 'مبيعات' },
  { value: 'gift', label: 'هدية' },
  { value: 'refund', label: 'استرداد' },
  { value: 'other', label: 'أخرى' },
];

export default function JarDetail() {
  const { jarId } = useParams<{ jarId: string }>();
  const navigate = useNavigate();
  const jar = useJarById(jarId || '');
  const transactions = useStore(state => state.transactions);
  const addTransaction = useStore(state => state.addTransaction);
  const deleteTransaction = useStore(state => state.deleteTransaction);
  const archiveJar = useStore(state => state.archiveJar);
  const deleteJar = useStore(state => state.deleteJar);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('other');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!jar) {
    return <div>الحصالة غير موجودة</div>;
  }

  const jarTransactions = transactions
    .filter(t => t.jarId === jar.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const required = jar.targetDate && jar.type === 'fixed' && jar.targetAmount
    ? calculateRequiredSavings(jar.targetAmount, jar.currentAmount, jar.targetDate)
    : null;

  const handleAdd = async () => {
    setError('');
    const parsedAmount = amount ? parseInt(amount.replace(/[^\d]/g, '')) : 0;
    if (parsedAmount <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }
    await addTransaction({
      jarId: jar.id,
      type: 'deposit',
      amount: parsedAmount,
      date: getTodayISO(),
      source: source as any,
      note: note.trim() || undefined,
    });
    setShowAddModal(false);
    setAmount('');
    setSource('other');
    setNote('');
  };

  const handleWithdraw = async () => {
    setError('');
    const parsedAmount = amount ? parseInt(amount.replace(/[^\d]/g, '')) : 0;
    if (parsedAmount <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (parsedAmount > jar.currentAmount) {
      setError(`لا يمكن سحب أكثر من الرصيد الحالي (${formatCurrency(jar.currentAmount)})`);
      return;
    }
    await addTransaction({
      jarId: jar.id,
      type: 'withdrawal',
      amount: parsedAmount,
      date: getTodayISO(),
      note: note.trim() || undefined,
    });
    setShowWithdrawModal(false);
    setAmount('');
    setNote('');
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowRight className="w-5 h-5" />
        رجوع
      </button>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${jar.color}20` }}>
              {iconMap[jar.icon] || '💰'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{jar.name}</h1>
              {jar.description && <p className="text-sm text-gray-500 dark:text-gray-400">{jar.description}</p>}
              <span className={`badge mt-1 ${jar.status === 'active' ? 'bg-emerald-100 text-emerald-700' : jar.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {jar.status === 'active' ? 'نشطة' : jar.status === 'completed' ? 'مكتملة' : 'مؤرشفة'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => archiveJar(jar.id)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" title="أرشفة">
              <Archive className="w-5 h-5" />
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="حذف">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {jar.type === 'fixed' && jar.targetAmount !== undefined ? (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-300">الحالي: <strong>{formatCurrency(jar.currentAmount)}</strong></span>
              <span className="text-gray-600 dark:text-gray-300">الهدف: <strong>{formatCurrency(jar.targetAmount)}</strong></span>
            </div>
            <ProgressBar progress={jar.progressPercent} color={jar.color} height="h-3" />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {jar.isOverTarget
                  ? `تم تجاوز الهدف بـ ${formatCurrency(jar.currentAmount - jar.targetAmount)}`
                  : `المتبقي: ${formatCurrency(jar.remainingAmount)}`}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{jar.progressPercent.toFixed(1)}%</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(jar.currentAmount)}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">حصالة مفتوحة</p>
          </div>
        )}
      </div>

      {required && jar.targetDate && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">📅 خطة الوصول للهدف</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">المطلوب شهريًا</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(Math.round(required.monthly))}</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">المطلوب أسبوعيًا</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(Math.round(required.weekly))}</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">المطلوب يوميًا</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(Math.round(required.daily))}</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">التاريخ المستهدف: {formatDate(jar.targetDate, 'dd/MM/yyyy')}</div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex-1">
          <Plus className="w-5 h-5" />
          إضافة مبلغ
        </button>
        <button onClick={() => setShowWithdrawModal(true)} className="btn-secondary flex-1">
          <Minus className="w-5 h-5" />
          سحب مبلغ
        </button>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">آخر المعاملات</h3>
        {jarTransactions.length === 0 ? (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500">لا توجد معاملات بعد</div>
        ) : (
          <div className="space-y-2">
            {jarTransactions.slice(0, 10).map(tx => (
              <TransactionItem key={tx.id} transaction={tx} jar={jar} onDelete={deleteTransaction} showJarName={false} />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة مبلغ">
        <div className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">المبلغ *</label>
            <input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="input-field" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">مصدر الأموال</label>
            <select value={source} onChange={e => setSource(e.target.value)} className="input-field">
              {incomeSources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظة (اختياري)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="أي ملاحظة..." className="input-field" />
          </div>
          <button onClick={handleAdd} className="btn-primary w-full">إضافة</button>
        </div>
      </Modal>

      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="سحب مبلغ">
        <div className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">المبلغ *</label>
            <input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="input-field" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظة (اختياري)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="سبب السحب..." className="input-field" />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">الرصيد الحالي: <strong>{formatCurrency(jar.currentAmount)}</strong></div>
          <button onClick={handleWithdraw} className="btn-secondary w-full">سحب</button>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="حذف الحصالة">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">هل أنت متأكد من حذف <strong>{jar.name}</strong>؟ سيتم حذف جميع المعاملات المرتبطة بها.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">💡 يمكنك الأرشفة بدلاً من الحذف للاحتفاظ بالبيانات.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1">إلغاء</button>
            <button onClick={async () => { await deleteJar(jar.id); navigate('/jars'); }} className="btn-danger flex-1">حذف نهائي</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}