
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Users, MapPin, Clock } from 'lucide-react';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { PlanningHeader } from './PlanningHeader';
import { TimeSlotCarousel } from './TimeSlotCarousel';
import { useToast } from '@/hooks/use-toast';

export function PlanningCalendar() {
  const {
    state,
    updateViewMode,
    getAssignments,
    handleDrop,
  } = useDeliveryPlanning();
  const { toast } = useToast();

  const [showCarousel, setShowCarousel] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, date: Date, timeSlot: string) => {
    e.preventDefault();
    
    // Try to get different types of drag data
    const zoneData = e.dataTransfer.getData('zone');
    const zoneGroupData = e.dataTransfer.getData('zoneGroup');
    const workerData = e.dataTransfer.getData('worker');
    const assignmentData = e.dataTransfer.getData('assignment');

    if (assignmentData) {
      // Handle assignment moving
      const assignment = JSON.parse(assignmentData);
      handleDrop(assignment, date, timeSlot);
    } else if (zoneData) {
      handleDrop({ type: 'zone', data: JSON.parse(zoneData) }, date, timeSlot);
    } else if (zoneGroupData) {
      handleDrop({ type: 'zoneGroup', data: JSON.parse(zoneGroupData) }, date, timeSlot);
    } else if (workerData) {
      handleDrop({ type: 'worker', data: JSON.parse(workerData) }, date, timeSlot);
    }
  };

  const handleTimeRangeSelect = useCallback((date: Date, startHour: number, endHour: number) => {
    toast({
      title: "Time range selected",
      description: `Selected ${date.toLocaleDateString()} from ${startHour}:00 to ${endHour}:00. Drag a zone from the sidebar to assign it.`,
    });
  }, [toast]);

  return (
    <div className="flex-1 p-6 space-y-6 animate-fade-in">
      <PlanningHeader />
      
      {/* View Toggle */}
      <div className="flex items-center justify-between">
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
            Week View
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
            Month View
          </Button>
          <Button
            variant={showCarousel ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCarousel(!showCarousel)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Time Carousel
          </Button>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{state.workers.length} workers available</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{state.zones.length} zones</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{state.assignments.length} assignments</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <Card className="overflow-hidden shadow-sm border border-gray-200">
        {showCarousel ? (
          <div className="p-6">
            <TimeSlotCarousel
              selectedDate={state.currentDate}
              onDrop={onDrop}
              onDragOver={handleDragOver}
              getAssignments={getAssignments}
            />
          </div>
        ) : state.viewMode === 'week' ? (
          <div className="h-[500px] md:h-[700px]">
            <WeekView
              onDrop={onDrop}
              onDragOver={handleDragOver}
              getAssignments={getAssignments}
              onTimeRangeSelect={handleTimeRangeSelect}
            />
          </div>
        ) : (
          <div className="p-6">
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
