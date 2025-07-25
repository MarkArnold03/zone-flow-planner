import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { DeliveryAssignment } from '@/types/delivery-planning';

interface WeekViewProps {
  onDrop: (e: React.DragEvent, date: Date, timeSlot: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  getAssignments: (date: Date, timeSlot: string) => DeliveryAssignment[];
}

export function WeekView({ onDrop, onDragOver, getAssignments }: WeekViewProps) {
  const { weekDays, removeAssignment } = useDeliveryPlanning();

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

  return (
    <div className="h-full bg-white rounded-lg">
      {/* Calendar Header - Days of the week */}
      <div className="border-b border-gray-200">
        <div className="grid grid-cols-8 gap-0">
          {/* Empty corner cell */}
          <div className="p-4 border-r border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-500"></div>
          </div>
          
          {/* Day headers */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-4 text-center border-r border-gray-200 bg-gray-50 last:border-r-0">
              <div className="text-sm font-medium text-gray-900">
                {format(day, 'EEEE')}
              </div>
              <div className="text-2xl font-semibold text-blue-600">
                {format(day, 'd')}
              </div>
              <div className="text-xs text-gray-500">
                {format(day, 'MMMM yyyy')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-0 min-h-full">
          {/* Time column */}
          <div className="border-r border-gray-200 bg-gray-50">
            {timeSlots.map((slot) => (
              <div key={slot.id} className="h-16 p-2 border-b border-gray-200 text-right">
                <div className="text-xs text-gray-500 font-medium">
                  {slot.label}
                </div>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="border-r border-gray-200 last:border-r-0">
              {timeSlots.map((slot) => {
                const assignments = getAssignments(day, slot.id);
                
                return (
                  <div
                    key={`${day.toISOString()}-${slot.id}`}
                    className="h-16 p-1 border-b border-gray-200 relative hover:bg-blue-50 transition-colors cursor-pointer"
                    onDrop={(e) => onDrop(e, day, slot.id)}
                    onDragOver={onDragOver}
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
                              className={`text-xs rounded-md px-2 py-1 relative group cursor-pointer shadow-sm border-l-4 ${
                                conflictSeverity === 'high' ? 'bg-red-100 border-red-500 text-red-800' :
                                conflictSeverity === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                                conflictSeverity === 'low' ? 'bg-blue-100 border-blue-500 text-blue-800' :
                                'bg-blue-100 border-blue-500 text-blue-800'
                              }`}
                              style={{
                                backgroundColor: assignment.zone?.color ? `${assignment.zone.color}20` : assignment.zoneGroup?.color ? `${assignment.zoneGroup.color}20` : undefined,
                                borderLeftColor: assignment.zone?.color || assignment.zoneGroup?.color
                              }}
                            >
                              <div className="font-medium truncate">
                                {assignment.zone?.name || assignment.zoneGroup?.name}
                              </div>
                              
                              {/* Worker Info */}
                              {assignment.workers && assignment.workers.length > 0 && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <div className="flex space-x-1">
                                    {assignment.workers.slice(0, 2).map((worker) => (
                                      <span 
                                        key={worker.id}
                                        className="inline-flex items-center justify-center w-4 h-4 bg-white/50 rounded-full text-xs font-medium"
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
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0 ml-auto"
                                    onClick={() => removeAssignment(assignment.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
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