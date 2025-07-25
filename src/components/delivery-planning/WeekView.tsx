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

  // Generate time slots from 5 AM to 9 PM (5-21)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 5;
    const displayHour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    return {
      id: `${hour}`,
      start: `${hour.toString().padStart(2, '0')}:00`,
      end: `${(hour + 1).toString().padStart(2, '0')}:00`,
      label: `${displayHour12}:00`,
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
    <div className="space-y-4">
      {/* Time Slots Header */}
      <div className="overflow-x-auto">
        <div className="grid gap-2 min-w-max" style={{ gridTemplateColumns: '100px repeat(17, 80px)' }}>
          <div className="p-2 text-center font-medium text-muted-foreground bg-muted/30 rounded-lg">
            Day / Time
          </div>
          {timeSlots.map((slot) => (
            <div key={slot.id} className="p-2 text-center font-medium bg-muted/30 rounded-lg">
              <div className="text-xs font-semibold">{slot.label}</div>
              <div className="text-xs text-muted-foreground">{slot.ampm}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Week Days Grid */}
      <div className="space-y-2">
        {weekDays.map((day) => (
          <div className="overflow-x-auto" key={day.toISOString()}>
            <div className="grid gap-2 min-w-max" style={{ gridTemplateColumns: '100px repeat(17, 80px)' }}>
              {/* Day Label */}
              <div className="p-3 text-center bg-muted/20 rounded-lg flex flex-col justify-center">
                <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
                <div className="text-xs text-muted-foreground">{format(day, 'MMM')}</div>
              </div>

              {/* Time Slot Cells */}
              {timeSlots.map((slot) => {
                const assignments = getAssignments(day, slot.id);
                
                return (
                  <div
                    key={`${day.toISOString()}-${slot.id}`}
                    className="min-h-[100px] border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 
                             hover:border-muted-foreground/50 hover:bg-muted/10 transition-all duration-200
                             cursor-pointer relative"
                    onDrop={(e) => onDrop(e, day, slot.id)}
                    onDragOver={onDragOver}
                  >
                    {assignments.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center">
                        Drop here
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {assignments.map((assignment) => {
                          const conflictSeverity = getConflictSeverity(assignment);
                          
                          return (
                            <Card 
                              key={assignment.id} 
                              className={`p-1 relative group text-xs ${
                                conflictSeverity === 'high' ? 'border-red-200 bg-red-50' :
                                conflictSeverity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                                conflictSeverity === 'low' ? 'border-blue-200 bg-blue-50' :
                                'border-green-200 bg-green-50'
                              }`}
                            >
                              <div className="space-y-1">
                                {/* Assignment Type Badge */}
                                {assignment.zone && (
                                  <div 
                                    className="text-xs rounded px-1 py-0.5 text-white font-medium truncate"
                                    style={{ backgroundColor: assignment.zone.color }}
                                    title={assignment.zone.name}
                                  >
                                    {assignment.zone.name}
                                  </div>
                                )}
                                
                                {assignment.zoneGroup && (
                                  <div 
                                    className="text-xs rounded px-1 py-0.5 text-white font-medium truncate"
                                    style={{ backgroundColor: assignment.zoneGroup.color }}
                                    title={assignment.zoneGroup.name}
                                  >
                                    {assignment.zoneGroup.name}
                                  </div>
                                )}

                                {/* Worker Info */}
                                {assignment.workers && assignment.workers.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <div className="flex space-x-1">
                                      {assignment.workers.slice(0, 3).map((worker) => (
                                        <span 
                                          key={worker.id}
                                          className="inline-flex items-center justify-center w-4 h-4 bg-primary/10 text-primary rounded-full text-xs font-medium"
                                        >
                                          {worker.initials}
                                        </span>
                                      ))}
                                      {assignment.workers.length > 3 && (
                                        <span className="text-xs text-muted-foreground">
                                          +{assignment.workers.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Conflict Indicator */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    {getConflictIcon(conflictSeverity || 'none')}
                                    {assignment.conflicts && assignment.conflicts.length > 0 && (
                                      <span className="text-xs">
                                        {assignment.conflicts.length}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Remove Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0"
                                    onClick={() => removeAssignment(assignment.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}