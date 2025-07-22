import React from 'react';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';

interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (newWeek: Date) => void;
}

export function WeekNavigation({ currentWeek, onWeekChange }: WeekNavigationProps) {
  const weekStart = React.useMemo(() => {
    const start = new Date(currentWeek);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(start.setDate(diff));
  }, [currentWeek]);

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(addDays(currentWeek, -7))}
        >
          ←
        </Button>
        <span className="text-sm font-medium">
          {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd')}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(addDays(currentWeek, 7))}
        >
          →
        </Button>
      </div>
    </div>
  );
}