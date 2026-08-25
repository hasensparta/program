interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    color?: string;
  }
  
  export default function StatCard({ label, value, icon, color = '#059669' }: StatCardProps) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: color }}>
            {icon}
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</div>
          </div>
        </div>
      </div>
    );
  }