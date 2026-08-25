import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getTodayISO } from '../utils/date';
import type { JarType } from '../types';

const jarIcons = [
  { value: 'phone', label: '📱', name: 'هاتف' },
  { value: 'laptop', label: '💻', name: 'لابتوب' },
  { value: 'car', label: '🚗', name: 'سيارة' },
  { value: 'travel', label: '✈️', name: 'سفر' },
  { value: 'wedding', label: '💍', name: 'زواج' },
  { value: 'home', label: '🏠', name: 'منزل' },
  { value: 'project', label: '💼', name: 'مشروع' },
  { value: 'emergency', label: '🚨', name: 'طوارئ' },
  { value: 'occasion', label: '🎉', name: 'مناسبة' },
  { value: 'other', label: '💰', name: 'أخرى' },
];

const jarColors = ['#059669', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#6366f1', '#14b8a6'];

const jarTemplates = [
  { name: 'صندوق الطوارئ', icon: 'emergency', description: 'صندوق للأمور غير المتوقعة', isEmergencyFund: true },
  { name: 'شراء سيارة', icon: 'car', description: '' },
  { name: 'شراء لابتوب', icon: 'laptop', description: '' },
  { name: 'شراء هاتف', icon: 'phone', description: '' },
  { name: 'السفر', icon: 'travel', description: '' },
  { name: 'الزواج', icon: 'wedding', description: '' },
];

export default function CreateJar() {
  const navigate = useNavigate();
  const addJar = useStore(state => state.addJar);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('other');
  const [color, setColor] = useState('#059669');
  const [jarType, setJarType] = useState<JarType>('fixed');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isEmergencyFund, setIsEmergencyFund] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('يرجى إدخال اسم الحصالة'); return; }

    const parsedTarget = targetAmount ? parseInt(targetAmount.replace(/[^\d]/g, '')) : undefined;
    const parsedInitial = initialAmount ? parseInt(initialAmount.replace(/[^\d]/g, '')) : 0;

    if (jarType === 'fixed' && (!parsedTarget || parsedTarget <= 0)) { setError('يرجى إدخال مبلغ مستهدف صحيح'); return; }
    if (parsedInitial < 0) { setError('المبلغ الابتدائي لا يمكن أن يكون سالبًا'); return; }

    const newJar = {
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      targetAmount: jarType === 'fixed' ? parsedTarget : undefined,
      startDate: getTodayISO(),
      targetDate: jarType === 'fixed' && targetDate ? targetDate : undefined,
      type: jarType,
      status: 'active' as const,
      isEmergencyFund,
    };

    const jarId = await addJar(newJar);

    if (parsedInitial > 0) {
      const { addTransaction } = useStore.getState();
      await addTransaction({ jarId, type: 'deposit', amount: parsedInitial, date: getTodayISO(), source: 'other', note: 'المبلغ الابتدائي' });
    }

    navigate(`/jars/${jarId}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowRight className="w-5 h-5" />
        رجوع
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">إنشاء حصالة جديدة</h1>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">قوالب جاهزة</h3>
        <div className="flex gap-2 flex-wrap">
          {jarTemplates.map(template => (
            <button
              key={template.name}
              onClick={() => { setName(template.name); setDescription(template.description); setIcon(template.icon); setIsEmergencyFund(template.isEmergencyFund || false); }}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {jarIcons.find(i => i.value === template.icon)?.label} {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الحصالة</h3>
        <div className="flex gap-2">
          <button onClick={() => setJarType('fixed')} className={`flex-1 px-4 py-3 rounded-xl border text-center transition-colors ${jarType === 'fixed' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <span className="block text-lg font-semibold">🎯</span>
            <span className="text-sm">بهدف محدد</span>
          </button>
          <button onClick={() => setJarType('open')} className={`flex-1 px-4 py-3 rounded-xl border text-center transition-colors ${jarType === 'open' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <span className="block text-lg font-semibold">📦</span>
            <span className="text-sm">مفتوحة (بدون هدف)</span>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الحصالة *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: شراء لابتوب" className="input-field" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف (اختياري)</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="أضف وصفًا مختصرًا..." className="input-field" rows={2} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الأيقونة</label>
        <div className="flex gap-2 flex-wrap">
          {jarIcons.map(iconItem => (
            <button key={iconItem.value} onClick={() => setIcon(iconItem.value)} title={iconItem.name} className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border transition-all ${icon === iconItem.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-110' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {iconItem.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اللون</label>
        <div className="flex gap-2 flex-wrap">
          {jarColors.map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {jarType === 'fixed' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المبلغ المستهدف *</label>
            <input type="text" inputMode="numeric" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="مثال: 1,500,000" className="input-field" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ المستهدف (اختياري)</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="input-field" min={getTodayISO()} />
          </div>
        </>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المبلغ الابتدائي (اختياري)</label>
        <input type="text" inputMode="numeric" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} placeholder="0" className="input-field" />
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full">إنشاء الحصالة</button>
    </div>
  );
}