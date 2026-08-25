import { Trash2 } from 'lucide-react';
import type { Transaction, Jar } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

interface TransactionItemProps {
  transaction: Transaction;
  jar?: Jar;
  onDelete?: (id: string) => void;
  showJarName?: boolean;
}

export default function TransactionItem({ transaction, jar, onDelete, showJarName = true }: TransactionItemProps) {
  const isDeposit = transaction.type === 'deposit';

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeposit ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          <span className={isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
            {isDeposit ? '+' : '-'}
          </span>
        </div>
        <div>
          <div className={`font-semibold ${isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {isDeposit ? '+' : '-'}{formatCurrency(transaction.amount)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(transaction.date)}
            {showJarName && jar && ` • ${jar.name}`}
            {transaction.source && ` • ${transaction.source}`}
          </div>
          {transaction.note && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{transaction.note}</div>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(transaction.id)}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}