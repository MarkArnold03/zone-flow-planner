
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Users, MapPin, Clock } from 'lucide-react';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { PlanningHeader } from './PlanningHeader';

import { AssignmentSummary } from './AssignmentSummary';
import { useToast } from '@/hooks/use-toast';
import { DeliveryAssignment } from '@/types/delivery-planning';

interface PlanningCalendarProps {
  selectedAssignment?: DeliveryAssignment | null;
  onAssignmentSelect?: (assignment: DeliveryAssignment | null) => void;
}

export function PlanningCalendar({ selectedAssignment, onAssignmentSelect }: PlanningCalendarProps) {
  const {
    state,
    updateViewMode,
    getAssignments,
    handleDrop,
  } = useDeliveryPlanning();
  const { toast } = useToast();

  const [showCarousel, setShowCarousel] = useState(false);
  const [dragSelection, setDragSelection] = useState<{ date: Date; startHour: number; endHour: number } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, date: Date, timeSlot: string) => {
    e.preventDefault();
    
    // Try to get different types of drag data
    const zoneData = e.dataTransfer.getData('zone');
    const zoneGroupData = e.dataTransfer.getData('zoneGroup');
    const assignmentData = e.dataTransfer.getData('application/json');

    if (assignmentData) {
      // Handle assignment moving
      try {
        const assignment = JSON.parse(assignmentData);
        // Update assignment's date and time slot
        const hour = parseInt(timeSlot);
        if (dragSelection && dragSelection.date.getTime() === date.getTime()) {
          // If dropping in a selected time range, use the range
          const updatedAssignment = {
            ...assignment,
            date,
            timeSlot: dragSelection.startHour.toString(),
            startHour: dragSelection.startHour,
            endHour: dragSelection.endHour
          };
          handleDrop(updatedAssignment, date, dragSelection.startHour.toString());
          setDragSelection(null);
        } else {
          // Regular single-hour assignment move
          const updatedAssignment = {
            ...assignment,
            date,
            timeSlot,
            startHour: hour,
            endHour: assignment.endHour ? hour + (assignment.endHour - assignment.startHour) : undefined
          };
          handleDrop(updatedAssignment, date, timeSlot);
        }
      } catch (error) {
        console.error('Error parsing assignment data:', error);
      }
    } else if (zoneData) {
      // If there's a selected time range, create a single assignment spanning the entire range
      if (dragSelection && dragSelection.date.getTime() === date.getTime()) {
        const zone = JSON.parse(zoneData);
        // Create single assignment with startHour and endHour
        handleDrop({ 
          type: 'zone', 
          data: zone,
          startHour: dragSelection.startHour,
          endHour: dragSelection.endHour
        }, date, dragSelection.startHour.toString());
        setDragSelection(null);
      } else {
        handleDrop({ type: 'zone', data: JSON.parse(zoneData) }, date, timeSlot);
      }
    } else if (zoneGroupData) {
      // Handle time span for zone groups too
      if (dragSelection && dragSelection.date.getTime() === date.getTime()) {
        const zoneGroup = JSON.parse(zoneGroupData);
        handleDrop({ 
          type: 'zoneGroup', 
          data: zoneGroup,
          startHour: dragSelection.startHour,
          endHour: dragSelection.endHour
        }, date, dragSelection.startHour.toString());
        setDragSelection(null);
      } else {
        handleDrop({ type: 'zoneGroup', data: JSON.parse(zoneGroupData) }, date, timeSlot);
      }
    }
  };

  const handleTimeRangeSelect = useCallback((date: Date, startHour: number, endHour: number) => {
    setDragSelection({ date, startHour, endHour });
    toast({
      title: "Tidsintervall valt",
      description: `Valt ${date.toLocaleDateString('sv-SE')} från ${startHour}:00 till ${endHour}:00. Dra en zon från sidopanelen för att tilldela den.`,
    });
  }, [toast]);

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 lg:p-6 animate-fade-in overflow-hidden h-full">
      <PlanningHeader selectedTimeRange={dragSelection} />
      
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={state.viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              updateViewMode('week');
              setShowCarousel(false);
            }}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Veckovy
          </Button>
          <Button
            variant={state.viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              updateViewMode('month');
              setShowCarousel(false);
            }}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Månadsvy
          </Button>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{state.zones.length} zoner</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{state.assignments.length} uppdrag</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <Card className="flex-1 flex flex-col shadow-soft border border-border bg-gradient-to-br from-card to-card/50 overflow-hidden">
        {state.viewMode === 'week' ? (
          <WeekView
            onDrop={onDrop}
            onDragOver={handleDragOver}
            getAssignments={getAssignments}
            onTimeRangeSelect={handleTimeRangeSelect}
            dragSelection={dragSelection}
            setDragSelection={setDragSelection}
            onAssignmentSelect={(assignment) => {
              onAssignmentSelect?.(assignment);
            }}
          />
        ) : (
          <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto">
            <MonthView
              onDrop={onDrop}
              onDragOver={handleDragOver}
              getAssignments={getAssignments}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
