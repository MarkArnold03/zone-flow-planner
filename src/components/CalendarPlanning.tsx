import React, { useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { MobilitySidebar } from './MobilitySidebar';
import { CalendarView } from './CalendarView';
import { BookingDialog } from './BookingDialog';

export function CalendarPlanning() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <MobilitySidebar />
      
      <div className="flex-1">
        <CalendarView 
          currentDate={currentDate}
          calendarDays={calendarDays}
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