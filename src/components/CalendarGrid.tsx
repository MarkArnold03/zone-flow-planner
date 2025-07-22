import React from 'react';
import { format } from 'date-fns';

const timeSlots = [
  { id: '08-12', label: '08:00 - 12:00' },
  { id: '12-16', label: '12:00 - 16:00' },
  { id: '16-20', label: '16:00 - 20:00' },
];

interface CalendarGridProps {
  weekDays: Date[];
}

export function CalendarGrid({ weekDays }: CalendarGridProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {timeSlots.map((slot) => (
        <div key={slot.id} className="border-b">
          <div className="p-3 bg-muted/30">
            <h4 className="text-sm font-semibold text-center">{slot.label}</h4>
          </div>
          <div className="grid grid-cols-7 gap-1 p-2">
            {weekDays.map((day) => (
              <div
                key={`${slot.id}-${format(day, 'yyyy-MM-dd')}`}
                className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded p-1 text-center hover:border-muted-foreground/50 cursor-pointer"
              >
                <div className="text-xs font-medium">
                  {format(day, 'EEE')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(day, 'dd')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}