
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { DeliveryAssignment } from '@/types/delivery-planning';
import { format } from 'date-fns';

interface TimeSlotCarouselProps {
  selectedDate: Date;
  onDrop: (e: React.DragEvent, date: Date, timeSlot: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  getAssignments: (date: Date, timeSlot: string) => DeliveryAssignment[];
}

export function TimeSlotCarousel({ selectedDate, onDrop, onDragOver, getAssignments }: TimeSlotCarouselProps) {
  const { removeAssignment } = useDeliveryPlanning();

  // Generate time slots from 5 AM to 9 PM (5-21)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 5;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return {
      id: `${hour}`,
      start: `${hour.toString().padStart(2, '0')}:00`,
      end: `${(hour + 1).toString().padStart(2, '0')}:00`,
      label: `${displayHour12}:00`,
      hour,
      ampm
    };
  });

  const handleRemoveAssignment = (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAssignment(assignmentId);
  };

  const handleDragStart = (e: React.DragEvent, assignment: DeliveryAssignment) => {
    e.dataTransfer.setData('assignment', JSON.stringify(assignment));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Time Slots - {format(selectedDate, 'EEE, MMM dd')}
          </h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Drag zones to time slots or drag assignments between slots
        </div>
      </div>

      {/* Carousel */}
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {timeSlots.map((slot) => {
            const assignments = getAssignments(selectedDate, slot.id);
            
            return (
              <CarouselItem key={slot.id} className="pl-2 md:pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5">
                <Card
                  className={`
                    h-32 border-2 border-dashed transition-all duration-200 cursor-pointer
                    hover:border-primary/50 hover:bg-muted/10
                    ${assignments.length > 0 ? 'border-solid border-primary/30 bg-primary/5' : 'border-muted-foreground/30'}
                  `}
                  onDrop={(e) => onDrop(e, selectedDate, slot.id)}
                  onDragOver={onDragOver}
                >
                  <CardContent className="p-3 h-full flex flex-col">
                    {/* Time Header */}
                    <div className="text-center mb-2">
                      <div className="text-sm font-semibold text-foreground">
                        {slot.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {slot.ampm}
                      </div>
                    </div>

                    {/* Assignments */}
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {assignments.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                          Drop zone here
                        </div>
                      ) : (
                        assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="group relative"
                            draggable
                            onDragStart={(e) => handleDragStart(e, assignment)}
                          >
                            {assignment.zone && (
                              <div
                                className="p-1 rounded text-xs text-white font-medium cursor-move flex items-center justify-between"
                                style={{ backgroundColor: assignment.zone.color }}
                              >
                                <span className="truncate flex-1">
                                  {assignment.zone.name}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                  onClick={(e) => handleRemoveAssignment(assignment.id, e)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            
                            {assignment.zoneGroup && (
                              <div
                                className="p-1 rounded text-xs text-white font-medium cursor-move flex items-center justify-between"
                                style={{ backgroundColor: assignment.zoneGroup.color }}
                              >
                                <span className="truncate flex-1">
                                  {assignment.zoneGroup.name}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                  onClick={(e) => handleRemoveAssignment(assignment.id, e)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}


                            {assignment.conflicts && assignment.conflicts.length > 0 && (
                              <div className="mt-1">
                                <Badge variant="destructive" className="text-xs h-4">
                                  ⚠️ {assignment.conflicts.length}
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Assignment Count */}
                    {assignments.length > 0 && (
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Legend */}
      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
        💡 Drag zones from sidebar to time slots, or drag assignments between time slots to reschedule
      </div>
    </div>
  );
}
