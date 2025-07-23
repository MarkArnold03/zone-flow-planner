import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { DeliveryAssignment } from '@/types/delivery-planning';

interface MonthViewProps {
  onDrop: (e: React.DragEvent, date: Date, timeSlot: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  getAssignments: (date: Date, timeSlot: string) => DeliveryAssignment[];
}

export function MonthView({ onDrop, onDragOver, getAssignments }: MonthViewProps) {
  const { state, timeSlots } = useDeliveryPlanning();

  // Get all days in the month view (including leading/trailing days)
  const monthStart = startOfMonth(state.currentDate);
  const monthEnd = endOfMonth(state.currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDayAssignments = (date: Date) => {
    const assignments = timeSlots.flatMap(slot => getAssignments(date, slot.id));
    return assignments;
  };

  const getAssignmentCounts = (date: Date) => {
    const assignments = getDayAssignments(date);
    return {
      total: assignments.length,
      conflicts: assignments.filter(a => a.conflicts && a.conflicts.length > 0).length,
      trucks: new Set(assignments.map(a => a.truck?.id).filter(Boolean)).size
    };
  };

  return (
    <div className="space-y-4">
      {/* Month Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">{format(state.currentDate, 'MMMM yyyy')}</h3>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground bg-muted/30 rounded">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, state.currentDate);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const counts = getAssignmentCounts(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[120px] border-2 border-dashed rounded-lg p-2 space-y-2
                hover:border-muted-foreground/50 hover:bg-muted/10 transition-all duration-200
                cursor-pointer relative
                ${isCurrentMonth 
                  ? 'border-muted-foreground/30 bg-background' 
                  : 'border-muted-foreground/10 bg-muted/20'
                }
                ${isToday ? 'ring-2 ring-primary/50' : ''}
              `}
              onDrop={(e) => {
                // For month view, we'll assign to morning slot by default
                onDrop(e, day, timeSlots[0].id);
              }}
              onDragOver={onDragOver}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between">
                <span className={`
                  text-sm font-medium
                  ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                  ${isToday ? 'text-primary font-bold' : ''}
                `}>
                  {format(day, 'd')}
                </span>
                
                {/* Quick Stats */}
                {counts.total > 0 && (
                  <div className="flex items-center space-x-1">
                    {counts.trucks > 0 && (
                      <Badge variant="secondary" className="text-xs h-5">
                        🚛 {counts.trucks}
                      </Badge>
                    )}
                    {counts.conflicts > 0 && (
                      <Badge variant="destructive" className="text-xs h-5">
                        ⚠️ {counts.conflicts}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Assignments Preview */}
              <div className="space-y-1">
                {timeSlots.map((slot) => {
                  const assignments = getAssignments(day, slot.id);
                  
                  if (assignments.length === 0) return null;
                  
                  return (
                    <div key={slot.id} className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium">
                        {slot.start}
                      </div>
                      {assignments.slice(0, 2).map((assignment) => (
                        <div key={assignment.id} className="text-xs">
                          {assignment.zone && (
                            <Badge 
                              variant="outline" 
                              className="text-xs h-4 px-1"
                              style={{ 
                                borderColor: assignment.zone.color,
                                color: assignment.zone.color
                              }}
                            >
                              {assignment.zone.name}
                            </Badge>
                          )}
                          {assignment.zoneGroup && (
                            <Badge 
                              variant="outline" 
                              className="text-xs h-4 px-1"
                              style={{ 
                                borderColor: assignment.zoneGroup.color,
                                color: assignment.zoneGroup.color
                              }}
                            >
                              {assignment.zoneGroup.name}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {assignments.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{assignments.length - 2} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Drop Zone Indicator */}
              {counts.total === 0 && isCurrentMonth && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/50">
                  Drop here
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}