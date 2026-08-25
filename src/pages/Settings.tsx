import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, Download, Upload, Trash2, Info } from 'lucide-react';
import Modal from '../components/Modal';

export default function Settings() {
  const { settings, updateSettings, exportData, importData, clearAllData } = useStore();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hassala-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('تم تصدير البيانات بنجاح');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleImport = async () => {
    setImportError('');
    const success = await importData(importText);
    if (success) {
      setShowImportModal(false);
      setImportText('');
      setSuccessMessage('تم استيراد البيانات بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setImportError('ملف غير صالح. يرجى التأكد من أن الملف بتنسيق JSON صحيح.');
    }
  };

  const handleClearData = async () => {
    await clearAllData();
    setShowClearModal(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">الإعدادات</h1>

      {successMessage && <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm">{successMessage}</div>}

      <div className="space-y-3">
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <div>
              <div className="font-medium">الوضع الليلي</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">تبديل المظهر الداكن</div>
            </div>
          </div>
          <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-emerald-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.darkMode ? 'right-1' : 'right-7'}`} />
          </button>
        </div>

        <button onClick={handleExport} className="card p-4 w-full flex items-center gap-3 cursor-pointer">
          <Download className="w-5 h-5 text-emerald-600" />
          <div className="text-right">
            <div className="font-medium">تصدير البيانات</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">نسخة احتياطية JSON</div>
          </div>
        </button>

        <button onClick={() => setShowImportModal(true)} className="card p-4 w-full flex items-center gap-3 cursor-pointer">
          <Upload className="w-5 h-5 text-blue-600" />
          <div className="text-right">
            <div className="font-medium">استيراد البيانات</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">استعادة نسخة احتياطية</div>
          </div>
        </button>

        <button onClick={() => setShowClearModal(true)} className="card p-4 w-full flex items-center gap-3 cursor-pointer border-red-200">
          <Trash2 className="w-5 h-5 text-red-600" />
          <div className="text-right">
            <div className="font-medium text-red-600">حذف جميع البيانات</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">لا يمكن التراجع</div>
          </div>
        </button>

        <div className="card p-4 flex items-center gap-3">
          <Info className="w-5 h-5 text-gray-400" />
          <div className="text-right">
            <div className="font-medium">حصالة HASSALA</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">الإصدار 1.0.0</div>
          </div>
        </div>
      </div>

      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="حذف جميع البيانات">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">⚠️ هل أنت متأكد؟ سيتم حذف جميع الحصالات والمعاملات والخطط نهائيًا.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">يوصى بتصدير نسخة احتياطية قبل الحذف.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowClearModal(false)} className="btn-secondary flex-1">إلغاء</button>
            <button onClick={handleClearData} className="btn-danger flex-1">حذف نهائي</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="استيراد البيانات">
        <div className="space-y-4">
          {importError && <div className="text-red-600 text-sm">{importError}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">الصق بيانات JSON</label>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} className="input-field" rows={6} placeholder='{"jars": [...], "transactions": [...], ...}' />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">سيتم استبدال البيانات الحالية بالبيانات المستوردة.</p>
          <button onClick={handleImport} className="btn-primary w-full">استيراد</button>
        </div>
      </Modal>
    </div>
  );
}