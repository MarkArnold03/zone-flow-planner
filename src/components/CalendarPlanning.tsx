import React, { useState } from 'react';
import { startOfWeek, addDays } from 'date-fns';
import { CalendarSidebar } from './CalendarSidebar';
import { FlowCanvas } from './FlowCanvas';

export function CalendarPlanning() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="min-h-screen bg-background flex">
      <CalendarSidebar 
        currentWeek={currentWeek}
        weekDays={weekDays}
        onWeekChange={setCurrentWeek}
      />
      
      <div className="flex-1">
        <FlowCanvas weekDays={weekDays} />
      </div>
    </div>
  );
}