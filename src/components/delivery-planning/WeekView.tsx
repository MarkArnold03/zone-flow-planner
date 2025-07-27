import React, { useState, useRef, useCallback } from 'react';
import { format, isToday, isSameDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, AlertTriangle, CheckCircle, X, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { DeliveryAssignment } from '@/types/delivery-planning';
import { ZoneAssignmentEditor } from './ZoneAssignmentEditor';
import { AssignmentSummary } from './AssignmentSummary';

interface WeekViewProps {
  onDrop: (e: React.DragEvent, date: Date, timeSlot: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  getAssignments: (date: Date, timeSlot: string) => DeliveryAssignment[];
  onTimeRangeSelect?: (date: Date, startHour: number, endHour: number) => void;
  dragSelection?: { date: Date; startHour: number; endHour: number } | null;
  setDragSelection?: React.Dispatch<React.SetStateAction<{ date: Date; startHour: number; endHour: number } | null>>;
  onAssignmentSelect?: (assignment: DeliveryAssignment) => void;
}

export function WeekView({ onDrop, onDragOver, getAssignments, onTimeRangeSelect, dragSelection: externalDragSelection, setDragSelection: setExternalDragSelection, onAssignmentSelect }: WeekViewProps) {
  const { weekDays, removeAssignment, state } = useDeliveryPlanning();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: Date; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: Date; hour: number } | null>(null);
  const [internalDragSelection, setInternalDragSelection] = useState<{ date: Date; startHour: number; endHour: number } | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<DeliveryAssignment | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null);
  
  // Use external drag selection if provided, otherwise use internal
  const dragSelection = externalDragSelection || internalDragSelection;
  const setDragSelection = setExternalDragSelection || setInternalDragSelection;

  // Generate time slots from 5 AM to 12 AM (midnight)
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = i + 5;
    const actualHour = hour > 23 ? hour - 24 : hour;
    const displayHour12 = actualHour === 0 ? 12 : actualHour > 12 ? actualHour - 12 : actualHour;
    const ampm = actualHour >= 12 ? 'PM' : 'AM';
    
    return {
      id: `${actualHour}`,
      start: `${actualHour.toString().padStart(2, '0')}:00`,
      end: `${((actualHour + 1) % 24).toString().padStart(2, '0')}:00`,
      label: `${displayHour12} ${ampm}`,
      hour: actualHour,
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
      case 'low': return <AlertTriangle className="h-3 w-3 text-primary" />;
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

  // Helper functions for today/current time highlighting
  const isCurrentHour = useCallback((date: Date, hour: number) => {
    if (!isToday(date)) return false;
    const now = new Date();
    return now.getHours() === hour;
  }, []);

  const getTodayClasses = useCallback((date: Date) => {
    return isToday(date) ? 'bg-today-highlight border-today-border' : '';
  }, []);

  const getCurrentTimeClasses = useCallback((date: Date, hour: number) => {
    return isCurrentHour(date, hour) ? 'bg-today-time-bg border-today-time' : '';
  }, [isCurrentHour]);

  // Get all multi-hour assignments that start at a specific hour
  const getStretchedAssignments = useCallback((date: Date, hour: number) => {
    // Get assignments specifically for this hour that have multi-hour spans
    return state.assignments.filter(assignment => 
      isSameDay(assignment.date, date) &&
      assignment.startHour === hour && 
      assignment.endHour && 
      assignment.endHour > assignment.startHour
    );
  }, [state.assignments]);

  // Check if a cell should be hidden because it's part of a stretched assignment
  const isPartOfStretchedAssignment = useCallback((date: Date, hour: number) => {
    // Look for assignments that start earlier but cover this hour
    for (let startHour = 0; startHour < hour; startHour++) {
      const assignments = getAssignments(date, startHour.toString());
      for (const assignment of assignments) {
        if (assignment.startHour === startHour && assignment.endHour && assignment.endHour > hour) {
          return true;
        }
      }
    }
    return false;
  }, [getAssignments]);

  return (
    <div className="h-full bg-card flex flex-col shadow-soft relative z-10" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Selection Display */}
      {dragSelection && (
        <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0 bg-primary/5">
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary font-medium">
              Valt: {format(dragSelection.date, 'EEE dd', { locale: sv })} {dragSelection.startHour}:00 - {dragSelection.endHour}:00
            </span>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded">
              Dra en zon från sidopanelen för att tilldela till denna tid
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Fixed Days Column */}
      <div className="flex border-b border-border bg-muted/30 flex-shrink-0">
        <div className="w-32 p-4 border-r border-border flex-shrink-0">
          <div className="text-sm font-medium text-muted-foreground">Dagar</div>
        </div>
        
        {/* Horizontal Time Header - Single scrollable area */}
        <div className="flex-1">
          <div className="overflow-x-auto">
            <div className="flex min-w-max">
              {timeSlots.map((slot) => (
                <div 
                  key={slot.id}
                  className={`w-24 p-2 text-center border-r border-border last:border-r-0 flex-shrink-0 transition-all duration-200 ${
                    weekDays.some(day => isCurrentHour(day, parseInt(slot.id))) ? 'bg-today-time-bg border-today-time' : ''
                  }`}
                >
                  <div className={`text-xs font-medium ${
                    weekDays.some(day => isCurrentHour(day, parseInt(slot.id))) ? 'text-today-time' : 'text-foreground'
                  }`}>
                    {slot.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Body - Scrollable vertically */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {weekDays.map((day, dayIndex) => (
          <div key={day.toISOString()} className="flex border-b border-border/30 last:border-b-0 min-h-[80px]">
            {/* Fixed Date column */}
            <div className={`w-32 p-4 border-r border-border flex-shrink-0 flex flex-col justify-center transition-all duration-200 ${getTodayClasses(day) || 'bg-muted/20'}`}>
              <div className={`text-sm font-medium transition-colors duration-200 ${isToday(day) ? 'text-today-time' : 'text-muted-foreground'}`}>
                {format(day, 'EEEE', { locale: sv })}
              </div>
              <div className={`text-xl font-semibold transition-all duration-200 ${isToday(day) ? 'text-today-time' : 'text-primary'}`}>
                {format(day, 'd')}
              </div>
              <div className={`text-xs transition-colors duration-200 ${isToday(day) ? 'text-today-time/80' : 'text-muted-foreground'}`}>
                {format(day, 'MMM yyyy', { locale: sv })}
              </div>
            </div>

            {/* Time slots row - Horizontally scrollable */}
            <div className="flex-1">
              <div className="overflow-x-auto h-full">
                <div className="flex min-w-max h-full">
                  {timeSlots.map((slot) => {
                    const assignments = getAssignments(day, slot.id);
                    const stretchedAssignments = getStretchedAssignments(day, parseInt(slot.id));
                    const hour = parseInt(slot.id);
                    const inDragRange = isInDragRange(day, hour);
                    const inSelection = isInSelection(day, hour);
                    const isHidden = isPartOfStretchedAssignment(day, hour);
                    
                    return (
                      <div
                        key={`${day.toISOString()}-${slot.id}`}
                        className={`w-24 h-full border-r border-border last:border-r-0 relative transition-all duration-200 cursor-pointer select-none flex-shrink-0 interactive ${
                          inDragRange ? 'bg-primary/30 border-primary/60' : 
                          inSelection ? 'bg-primary/20 border-2 border-primary ring-2 ring-primary/20' :
                          getCurrentTimeClasses(day, hour) ||
                          (isToday(day) ? 'bg-today-highlight/50' : 'hover:bg-muted/50')
                        }`}
                        onDrop={(e) => onDrop(e, day, slot.id)}
                        onDragOver={onDragOver}
                        onMouseDown={(e) => handleMouseDown(day, hour, e)}
                        onMouseEnter={() => handleMouseEnter(day, hour)}
                       >
                         {/* Show stretched assignments that start at this hour */}
                          {stretchedAssignments.map((assignment, assignmentIndex) => {
                            const conflictSeverity = getConflictSeverity(assignment);
                            const hourSpan = (assignment.endHour || hour + 1) - hour;
                            const calculatedWidth = hourSpan * 96 + (hourSpan - 1) * 1; // 96px per cell + border
                           
                           return (
                              <div 
                                key={assignment.id} 
                                className={`absolute top-1 left-1 rounded-lg p-2 group cursor-pointer shadow-medium border-l-4 z-20 overflow-hidden flex flex-col transition-all duration-200 hover:shadow-heavy ${
                                  conflictSeverity === 'high' ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-950/50' :
                                  conflictSeverity === 'medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-950/50' :
                                  conflictSeverity === 'low' ? 'bg-primary/5 border-primary text-primary dark:bg-primary/10' :
                                  'bg-card border-primary text-primary'
                                }`}
                               style={{
                                 width: `${calculatedWidth - 4}px`,
                                 height: `calc(100% - 8px)`,
                                 top: `${assignmentIndex * 22 + 4}px`, // Stack multiple assignments
                                 backgroundColor: assignment.zone?.color ? `${assignment.zone.color}15` : assignment.zoneGroup?.color ? `${assignment.zoneGroup.color}15` : undefined,
                                 borderLeftColor: assignment.zone?.color || assignment.zoneGroup?.color
                               }}
                               draggable
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setSelectedAssignment(assignment);
                                 onAssignmentSelect?.(assignment);
                               }}
                               onDragStart={(e) => {
                                 e.dataTransfer.setData('assignment', JSON.stringify(assignment));
                               }}
                             >
                                <div className="font-medium truncate text-xs">
                                  {assignment.zone?.name || assignment.zoneGroup?.name}
                                </div>
                                <div className="text-xs opacity-75 mb-1">
                                  {assignment.startHour}:00 - {assignment.endHour}:00
                                </div>
                               
                                {/* Edit and Remove Buttons */}
                                 <div className="flex-1 flex justify-end items-start">
                                   <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-4 w-4 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingAssignment(assignment);
                                        }}
                                      >
                                        <Edit className="h-3 w-3 text-primary" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-4 w-4 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeAssignment(assignment.id);
                                        }}
                                      >
                                        <X className="h-3 w-3 text-destructive" />
                                      </Button>
                                   </div>
                                 </div>

                               {/* Conflict Indicator */}
                               {conflictSeverity && (
                                 <div className="absolute -top-1 -right-1">
                                   {getConflictIcon(conflictSeverity)}
                                 </div>
                               )}
                             </div>
                           );
                         })}
                      
                      {/* Show regular assignments (not stretched) if this cell is not hidden */}
                       {!isHidden && (
                         <div className="p-1 h-full overflow-hidden">
                            {/* Filter out multi-hour assignments that don't start at this hour */}
                            {assignments.filter(a => 
                              !(a.startHour !== undefined && a.endHour !== undefined && a.startHour !== hour)
                            ).map((assignment, assignmentIndex) => {
                              const conflictSeverity = getConflictSeverity(assignment);
                              
                              return (
                                <div 
                                  key={assignment.id} 
                                  className={`rounded-lg p-2 relative group cursor-pointer shadow-heavy border-l-4 transition-all duration-300 hover:shadow-glow hover:scale-105 flex flex-col mb-1 ${
                                    conflictSeverity === 'high' ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-950/50 shadow-glow' :
                                    conflictSeverity === 'medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-950/50 shadow-medium' :
                                   conflictSeverity === 'low' ? 'bg-primary/5 border-primary text-primary dark:bg-primary/10 shadow-soft' :
                                   'bg-gradient-card border-primary text-primary shadow-float'
                                  }`}
                                  style={{
                                    backgroundColor: assignment.zone?.color ? `${assignment.zone.color}15` : assignment.zoneGroup?.color ? `${assignment.zoneGroup.color}15` : undefined,
                                    borderLeftColor: assignment.zone?.color || assignment.zoneGroup?.color,
                                    height: 'calc(50% - 2px)' // Allow stacking
                                  }}
                                 draggable
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setSelectedAssignment(assignment);
                                   onAssignmentSelect?.(assignment);
                                 }}
                                 onDragStart={(e) => {
                                   e.dataTransfer.setData('assignment', JSON.stringify(assignment));
                                 }}
                               >
                                  <div className="font-medium truncate text-xs flex-1">
                                    {assignment.zone?.name || assignment.zoneGroup?.name}
                                  </div>
                                  
                                   {/* Edit and Remove Buttons */}
                                   <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-5 w-5 p-0 bg-white/80 hover:bg-white border border-border/50 shadow-sm"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setEditingAssignment(assignment);
                                       }}
                                     >
                                       <Edit className="h-3 w-3 text-primary" />
                                     </Button>
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-5 w-5 p-0 bg-white/80 hover:bg-destructive/20 border border-border/50 shadow-sm"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         removeAssignment(assignment.id);
                                       }}
                                     >
                                       <X className="h-3 w-3 text-destructive" />
                                     </Button>
                                   </div>

                                 {/* Conflict Indicator */}
                                 {conflictSeverity && (
                                   <div className="absolute -top-1 -right-1">
                                     {getConflictIcon(conflictSeverity)}
                                   </div>
                                 )}
                               </div>
                              );
                            })}
                            
                            {/* Show empty state if no assignments and not in selection */}
                            {assignments.filter(a => 
                              !(a.startHour !== undefined && a.endHour !== undefined && a.startHour !== hour)
                            ).length === 0 && !inSelection && (
                              <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200">
                                <div className="text-xs text-muted-foreground/50">+</div>
                              </div>
                            )}
                          </div>
                       )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zone Assignment Editor */}
      <ZoneAssignmentEditor
        assignment={editingAssignment}
        open={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
      />
    </div>
  );
}