import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, actionPath }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">{description}</p>
      {actionLabel && actionPath && (
        <button onClick={() => navigate(actionPath)} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}