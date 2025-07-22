import React, { useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface WeekCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
}

const timeSlots = [
  { id: '08-12', label: '08:00 - 12:00' },
  { id: '12-16', label: '12:00 - 16:00' }
];

const weekDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

// Mock bookings data
const mockBookings = [
  { date: new Date(2025, 0, 15), zone: 'Stockholm', timeSlot: '08-12', count: 3 },
  { date: new Date(2025, 0, 16), zone: 'Express', timeSlot: '12-16', count: 1 },
  { date: new Date(2025, 0, 20), zone: 'Göteborg', timeSlot: '08-12', count: 2 },
];

export function WeekCalendarView({ currentDate, onDateChange, onDateClick }: WeekCalendarViewProps) {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<{[key: string]: any}>({});

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => {
    onDateChange(subWeeks(currentDate, 1));
  };

  const goToNextWeek = () => {
    onDateChange(addWeeks(currentDate, 1));
  };

  const handleDrop = (e: React.DragEvent, date: Date, timeSlot: string) => {
    e.preventDefault();
    const zoneData = JSON.parse(e.dataTransfer.getData('zone'));
    const key = `${format(date, 'yyyy-MM-dd')}-${timeSlot}`;
    
    setAssignments(prev => ({
      ...prev,
      [key]: zoneData
    }));

    toast({
      title: "Zon tilldelad",
      description: `${zoneData.name} tilldelad till ${format(date, 'EEE dd')} ${timeSlot}`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getAssignment = (date: Date, timeSlot: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${timeSlot}`;
    return assignments[key];
  };

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-foreground">
            Vecka {format(weekStart, 'w, yyyy')}
          </h2>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {format(weekStart, 'dd MMM')} - {format(addDays(weekStart, 6), 'dd MMM yyyy')}
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Time Slots Header */}
          <div className="grid grid-cols-8 border-b bg-muted/30">
            <div className="p-4"></div>
            {timeSlots.map((slot) => (
              <div key={slot.id} className="col-span-3 p-4 text-center font-medium border-r">
                {slot.label}
              </div>
            ))}
          </div>

          {/* Week Days */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="grid grid-cols-8 border-b">
              {/* Day Label */}
              <div className="p-4 font-medium text-center bg-muted/20 border-r">
                <div className="text-sm">{format(day, 'EEE')}</div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
              </div>

              {/* Time Slot Cells */}
              {timeSlots.map((slot) => (
                <div
                  key={`${day.toISOString()}-${slot.id}`}
                  className="col-span-3 min-h-[100px] border-r border-dashed border-muted-foreground/30 p-3 cursor-pointer hover:bg-muted/20 transition-colors"
                  onDrop={(e) => handleDrop(e, day, slot.id)}
                  onDragOver={handleDragOver}
                  onClick={() => onDateClick(day)}
                >
                  {getAssignment(day, slot.id) && (
                    <Badge 
                      variant="secondary" 
                      className="w-full justify-start text-xs"
                      style={{ 
                        backgroundColor: getAssignment(day, slot.id).color + '20',
                        borderColor: getAssignment(day, slot.id).color 
                      }}
                    >
                      {getAssignment(day, slot.id).name}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}