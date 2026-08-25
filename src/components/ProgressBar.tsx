interface ProgressBarProps {
    progress: number;
    color?: string;
    height?: string;
    showLabel?: boolean;
  }
  
  export default function ProgressBar({ progress, color = '#059669', height = 'h-2', showLabel = false }: ProgressBarProps) {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    return (
      <div className="w-full">
        <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
          <div
            className={`${height} rounded-full transition-all duration-500 ease-out`}
            style={{
              width: `${clampedProgress}%`,
              backgroundColor: clampedProgress >= 100 ? '#10b981' : color,
            }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-left">
            {clampedProgress.toFixed(1)}%
          </div>
        )}
      </div>
    );
  }