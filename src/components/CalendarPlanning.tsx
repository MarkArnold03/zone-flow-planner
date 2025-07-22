import React, { useState } from 'react';
import { startOfWeek, addDays } from 'date-fns';
import { MobilitySidebar } from './MobilitySidebar';
import { WeekCalendarView } from './WeekCalendarView';
import { BookingDialog } from './BookingDialog';

export function CalendarPlanning() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <MobilitySidebar />
      
      <div className="flex-1">
        <WeekCalendarView 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onDateClick={handleDateClick}
        />
      </div>

      <BookingDialog 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}