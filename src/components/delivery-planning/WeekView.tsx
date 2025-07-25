import React, { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
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
  const { weekDays, removeAssignment } = useDeliveryPlanning();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: Date; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: Date; hour: number } | null>(null);
  const [internalDragSelection, setInternalDragSelection] = useState<{ date: Date; startHour: number; endHour: number } | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<DeliveryAssignment | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null);
  
  // Use external drag selection if provided, otherwise use internal
  const dragSelection = externalDragSelection || internalDragSelection;
  const setDragSelection = setExternalDragSelection || setInternalDragSelection;

  // Generate time slots from 5 AM to 11 PM (24-hour format like Outlook)
  const timeSlots = Array.from({ length: 19 }, (_, i) => {
    const hour = i + 5;
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

  // Get all multi-hour assignments that start at a specific hour
  const getStretchedAssignments = useCallback((date: Date, hour: number) => {
    const allAssignments = getAssignments(date, hour.toString());
    return allAssignments.filter(assignment => 
      assignment.startHour === hour && assignment.endHour && assignment.endHour > assignment.startHour
    );
  }, [getAssignments]);

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
    <div className="h-full bg-background rounded-lg" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Selection Display */}
      {dragSelection && (
        <div className="p-2 bg-muted/50 border-b border-muted-foreground/20 flex items-center justify-between">
          <span className="text-sm text-primary">
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
              <div className="text-lg md:text-2xl font-semibold text-primary">
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
                const stretchedAssignments = getStretchedAssignments(day, parseInt(slot.id));
                const hour = parseInt(slot.id);
                const inDragRange = isInDragRange(day, hour);
                const inSelection = isInSelection(day, hour);
                const isHidden = isPartOfStretchedAssignment(day, hour);
                
                return (
                  <div
                    key={`${day.toISOString()}-${slot.id}`}
                    className={`h-12 md:h-16 p-1 border-b border-gray-200 relative transition-colors cursor-pointer select-none ${
                      inDragRange ? 'bg-primary/20' : 
                      inSelection ? 'bg-primary/10 border border-primary/30' :
                      'hover:bg-muted/50'
                    }`}
                    onDrop={(e) => onDrop(e, day, slot.id)}
                    onDragOver={onDragOver}
                    onMouseDown={(e) => handleMouseDown(day, hour, e)}
                    onMouseEnter={() => handleMouseEnter(day, hour)}
                  >
                    {/* Show stretched assignments that start at this hour */}
                    {stretchedAssignments.map((assignment) => {
                      const conflictSeverity = getConflictSeverity(assignment);
                      const hourSpan = (assignment.endHour || hour + 1) - hour;
                      const cellHeight = window.innerWidth >= 768 ? 64 : 48; // md:h-16 = 64px, h-12 = 48px
                      const borderHeight = 1; // border-b
                      const calculatedHeight = hourSpan * cellHeight + (hourSpan - 1) * borderHeight - 8; // -8 for padding
                      
                      return (
                        <div 
                          key={assignment.id} 
                          className={`absolute left-0 right-0 top-0 rounded-md px-2 py-1 group cursor-pointer shadow-sm border-l-4 z-20 overflow-hidden flex flex-col ${
                            conflictSeverity === 'high' ? 'bg-red-100 border-red-500 text-red-800' :
                            conflictSeverity === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                            conflictSeverity === 'low' ? 'bg-primary/10 border-primary text-primary-foreground' :
                            'bg-primary/10 border-primary text-primary-foreground'
                          }`}
                          style={{
                            height: `${hourSpan * cellHeight + (hourSpan - 1) * borderHeight}px`,
                            backgroundColor: assignment.zone?.color ? `${assignment.zone.color}30` : assignment.zoneGroup?.color ? `${assignment.zoneGroup.color}30` : undefined,
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
                          <div className="font-medium truncate text-sm">
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
                                 className="opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0 hover:bg-blue-200"
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
                                 className="opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0 hover:bg-red-200"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   removeAssignment(assignment.id);
                                 }}
                               >
                                 <X className="h-3 w-3 text-red-600" />
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
                    {!isHidden && assignments.filter(a => !a.startHour || !a.endHour || a.startHour === hour).length === 0 ? (
                      <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-xs text-gray-400">+</div>
                      </div>
                    ) : !isHidden && (
                      <div className="space-y-1 h-full overflow-hidden">
                        {assignments.filter(a => !a.startHour || !a.endHour || a.startHour === hour).map((assignment) => {
                          const conflictSeverity = getConflictSeverity(assignment);
                          
                          return (
                            <div 
                              key={assignment.id} 
                              className={`text-xs rounded-md px-1 md:px-2 py-1 relative group cursor-pointer shadow-sm border-l-2 md:border-l-4 h-full ${
                                conflictSeverity === 'high' ? 'bg-red-100 border-red-500 text-red-800' :
                                conflictSeverity === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                               conflictSeverity === 'low' ? 'bg-primary/10 border-primary text-primary-foreground' :
                               'bg-primary/10 border-primary text-primary-foreground'
                              }`}
                              style={{
                                backgroundColor: assignment.zone?.color ? `${assignment.zone.color}20` : assignment.zoneGroup?.color ? `${assignment.zoneGroup.color}20` : undefined,
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
                              <div className="font-medium truncate text-xs md:text-sm">
                                {assignment.zone?.name || assignment.zoneGroup?.name}
                              </div>
                              
                               {/* Edit and Remove Buttons */}
                               <div className="flex justify-end mt-1">
                                 <div className="flex gap-1">
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="opacity-0 group-hover:opacity-100 transition-opacity h-3 w-3 md:h-4 md:w-4 p-0 hover:bg-blue-200"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setEditingAssignment(assignment);
                                     }}
                                   >
                                     <Edit className="h-2 w-2 md:h-3 md:w-3 text-primary" />
                                   </Button>
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
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
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