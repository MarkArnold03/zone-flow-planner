import React, { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { DeliveryAssignment } from '@/types/delivery-planning';

interface WeekViewProps {
  onDrop: (e: React.DragEvent, date: Date, timeSlot: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  getAssignments: (date: Date, timeSlot: string) => DeliveryAssignment[];
  onTimeRangeSelect?: (date: Date, startHour: number, endHour: number) => void;
}

export function WeekView({ onDrop, onDragOver, getAssignments, onTimeRangeSelect }: WeekViewProps) {
  const { weekDays, removeAssignment } = useDeliveryPlanning();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: Date; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: Date; hour: number } | null>(null);
  const [dragSelection, setDragSelection] = useState<{ date: Date; startHour: number; endHour: number } | null>(null);

  // Generate time slots from 12 AM to 11 PM (24-hour format like Outlook)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const displayHour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    return {
      id: `${hour}`,
      start: `${hour.toString().padStart(2, '0')}:00`,
      end: `${(hour + 1).toString().padStart(2, '0')}:00`,
      label: `${displayHour12} ${ampm}`,
      hour,
      ampm
    };
  });

  const getConflictSeverity = (assignment: DeliveryAssignment) => {
    if (!assignment.conflicts || assignment.conflicts.length === 0) return null;
    const maxSeverity = assignment.conflicts.reduce((max, conflict) => {
      if (conflict.severity === 'high') return 'high';
      if (conflict.severity === 'medium' && max !== 'high') return 'medium';
      return max === 'high' ? 'high' : 'low';
    }, 'low' as 'low' | 'medium' | 'high');
    return maxSeverity;
  };

  const getConflictIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'low': return <AlertTriangle className="h-3 w-3 text-blue-500" />;
      default: return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
  };

  const handleMouseDown = useCallback((date: Date, hour: number, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ date, hour });
    setDragEnd({ date, hour });
    e.preventDefault();
  }, []);

  const handleMouseEnter = useCallback((date: Date, hour: number) => {
    if (isDragging && dragStart && dragStart.date.getTime() === date.getTime()) {
      setDragEnd({ date, hour });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd && dragStart.date.getTime() === dragEnd.date.getTime()) {
      const startHour = Math.min(dragStart.hour, dragEnd.hour);
      const endHour = Math.max(dragStart.hour, dragEnd.hour) + 1;
      setDragSelection({ date: dragStart.date, startHour, endHour });
      onTimeRangeSelect?.(dragStart.date, startHour, endHour);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, onTimeRangeSelect]);

  const clearSelection = useCallback(() => {
    setDragSelection(null);
  }, []);

  const isInDragRange = useCallback((date: Date, hour: number) => {
    if (!isDragging || !dragStart || !dragEnd || dragStart.date.getTime() !== date.getTime()) return false;
    const start = Math.min(dragStart.hour, dragEnd.hour);
    const end = Math.max(dragStart.hour, dragEnd.hour);
    return hour >= start && hour <= end;
  }, [isDragging, dragStart, dragEnd]);

  const isInSelection = useCallback((date: Date, hour: number) => {
    if (!dragSelection || dragSelection.date.getTime() !== date.getTime()) return false;
    return hour >= dragSelection.startHour && hour < dragSelection.endHour;
  }, [dragSelection]);

  return (
    <div className="h-full bg-white rounded-lg" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Selection Display */}
      {dragSelection && (
        <div className="p-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
          <span className="text-sm text-blue-700">
            Selected: {format(dragSelection.date, 'EEE dd')} {dragSelection.startHour}:00 - {dragSelection.endHour}:00
          </span>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Calendar Header - Days of the week */}
      <div className="border-b border-gray-200">
        <div className="grid grid-cols-8 gap-0 md:grid-cols-8 sm:grid-cols-4">
          {/* Empty corner cell */}
          <div className="p-2 md:p-4 border-r border-gray-200 bg-gray-50">
            <div className="text-xs md:text-sm font-medium text-gray-500"></div>
          </div>
          
          {/* Day headers */}
          {weekDays.map((day, index) => (
            <div 
              key={day.toISOString()} 
              className={`p-2 md:p-4 text-center border-r border-gray-200 bg-gray-50 last:border-r-0 ${
                index >= 3 ? 'hidden sm:block' : ''
              }`}
            >
              <div className="text-xs md:text-sm font-medium text-gray-900">
                <span className="hidden md:inline">{format(day, 'EEEE')}</span>
                <span className="md:hidden">{format(day, 'EEE')}</span>
              </div>
              <div className="text-lg md:text-2xl font-semibold text-blue-600">
                {format(day, 'd')}
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                {format(day, 'MMMM yyyy')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-0 min-h-full md:grid-cols-8 sm:grid-cols-4">
          {/* Time column */}
          <div className="border-r border-gray-200 bg-gray-50">
            {timeSlots.map((slot) => (
              <div key={slot.id} className="h-12 md:h-16 p-1 md:p-2 border-b border-gray-200 text-right">
                <div className="text-xs text-gray-500 font-medium">
                  <span className="hidden md:inline">{slot.label}</span>
                  <span className="md:hidden">{slot.start}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => (
            <div 
              key={day.toISOString()} 
              className={`border-r border-gray-200 last:border-r-0 ${
                dayIndex >= 3 ? 'hidden sm:block' : ''
              }`}
            >
              {timeSlots.map((slot) => {
                const assignments = getAssignments(day, slot.id);
                const hour = parseInt(slot.id);
                const inDragRange = isInDragRange(day, hour);
                const inSelection = isInSelection(day, hour);
                
                return (
                  <div
                    key={`${day.toISOString()}-${slot.id}`}
                    className={`h-12 md:h-16 p-1 border-b border-gray-200 relative transition-colors cursor-pointer select-none ${
                      inDragRange ? 'bg-blue-200' : 
                      inSelection ? 'bg-blue-100 border border-blue-300' :
                      'hover:bg-blue-50'
                    }`}
                    onDrop={(e) => onDrop(e, day, slot.id)}
                    onDragOver={onDragOver}
                    onMouseDown={(e) => handleMouseDown(day, hour, e)}
                    onMouseEnter={() => handleMouseEnter(day, hour)}
                  >
                    {assignments.length === 0 ? (
                      <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-xs text-gray-400">+</div>
                      </div>
                    ) : (
                      <div className="space-y-1 h-full overflow-hidden">
                        {assignments.map((assignment) => {
                          const conflictSeverity = getConflictSeverity(assignment);
                          
                          return (
                            <div 
                              key={assignment.id} 
                              className={`text-xs rounded-md px-1 md:px-2 py-1 relative group cursor-pointer shadow-sm border-l-2 md:border-l-4 ${
                                conflictSeverity === 'high' ? 'bg-red-100 border-red-500 text-red-800' :
                                conflictSeverity === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                                conflictSeverity === 'low' ? 'bg-blue-100 border-blue-500 text-blue-800' :
                                'bg-blue-100 border-blue-500 text-blue-800'
                              }`}
                              style={{
                                backgroundColor: assignment.zone?.color ? `${assignment.zone.color}20` : assignment.zoneGroup?.color ? `${assignment.zoneGroup.color}20` : undefined,
                                borderLeftColor: assignment.zone?.color || assignment.zoneGroup?.color
                              }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('assignment', JSON.stringify(assignment));
                              }}
                            >
                              <div className="font-medium truncate text-xs md:text-sm">
                                {assignment.zone?.name || assignment.zoneGroup?.name}
                              </div>
                              
                              {/* Worker Info */}
                              {assignment.workers && assignment.workers.length > 0 && (
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex space-x-1">
                                    {assignment.workers.slice(0, 2).map((worker) => (
                                      <span 
                                        key={worker.id}
                                        className="inline-flex items-center justify-center w-3 h-3 md:w-4 md:h-4 bg-white/50 rounded-full text-xs font-medium"
                                      >
                                        {worker.initials}
                                      </span>
                                    ))}
                                    {assignment.workers.length > 2 && (
                                      <span className="text-xs opacity-75">
                                        +{assignment.workers.length - 2}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Remove Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-3 w-3 md:h-4 md:w-4 p-0 hover:bg-red-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeAssignment(assignment.id);
                                    }}
                                  >
                                    <X className="h-2 w-2 md:h-3 md:w-3 text-red-600" />
                                  </Button>
                                </div>
                              )}

                              {/* Conflict Indicator */}
                              {conflictSeverity && (
                                <div className="absolute -top-1 -right-1">
                                  {getConflictIcon(conflictSeverity)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}