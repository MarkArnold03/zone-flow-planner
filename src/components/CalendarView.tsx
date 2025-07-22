import React from 'react';
import { format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  currentDate: Date;
  calendarDays: Date[];
  onDateChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
}

const weekDays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

// Mock bookings data - in real app this would come from a data source
const mockBookings = [
  { date: new Date(2025, 0, 15), zone: 'Stockholm', timeSlot: '08:00 - 12:00', count: 3 },
  { date: new Date(2025, 0, 16), zone: 'Express', timeSlot: '12:00 - 16:00', count: 1 },
  { date: new Date(2025, 0, 20), zone: 'Göteborg', timeSlot: '08:00 - 16:00', count: 2 },
];

export function CalendarView({ currentDate, calendarDays, onDateChange, onDateClick }: CalendarViewProps) {
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const getBookingsForDate = (date: Date) => {
    return mockBookings.filter(booking => isSameDay(booking.date, date));
  };

  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Kalender</Button>
          <Button variant="ghost" size="sm">Ordrar</Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div key={day} className="p-4 text-center font-medium text-muted-foreground bg-muted/30">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const bookings = getBookingsForDate(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[120px] p-2 border-r border-b cursor-pointer hover:bg-muted/30 transition-colors ${
                      !isCurrentMonth ? 'text-muted-foreground bg-muted/10' : ''
                    } ${isTodayDate ? 'bg-primary/5 border-primary/20' : ''}`}
                    onClick={() => onDateClick(day)}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-sm font-medium mb-2 ${isTodayDate ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        {bookings.map((booking, index) => (
                          <div key={index} className="text-xs">
                            <Badge 
                              variant="secondary" 
                              className="w-full justify-start text-xs py-0.5"
                            >
                              {booking.zone} ({booking.count})
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}