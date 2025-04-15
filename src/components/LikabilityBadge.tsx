
import React from 'react';
import { CirclePercent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikabilityBadgeProps {
  percentage: number;
  className?: string;
}

const LikabilityBadge: React.FC<LikabilityBadgeProps> = ({ percentage, className }) => {
  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 85) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900';
    if (percentage >= 70) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900';
    if (percentage >= 50) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900';
    return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-900';
  };

  return (
    <div className={cn(
      'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border',
      getColor(),
      className
    )}>
      <CirclePercent className="h-3 w-3" />
      <span>{percentage}%</span>
    </div>
  );
};

export default LikabilityBadge;
