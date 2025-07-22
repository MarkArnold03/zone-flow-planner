import React from 'react';
import { WeekNavigation } from './WeekNavigation';
import { ZoneList } from './ZoneList';
import { CalendarGrid } from './CalendarGrid';

interface CalendarSidebarProps {
  currentWeek: Date;
  weekDays: Date[];
  onWeekChange: (newWeek: Date) => void;
}

export function CalendarSidebar({ currentWeek, weekDays, onWeekChange }: CalendarSidebarProps) {
  return (
    <div className="w-80 border-r bg-card shadow-lg">
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-foreground">
          Leveransplanering
        </h2>
        <p className="text-xs text-muted-foreground">
          Dra zoner till tidsplatser
        </p>
      </div>

      <WeekNavigation currentWeek={currentWeek} onWeekChange={onWeekChange} />
      <ZoneList />
      <CalendarGrid weekDays={weekDays} />
    </div>
  );
}