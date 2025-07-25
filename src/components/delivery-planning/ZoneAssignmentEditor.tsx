import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin } from 'lucide-react';
import { DeliveryAssignment } from '@/types/delivery-planning';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { useToast } from '@/hooks/use-toast';

interface ZoneAssignmentEditorProps {
  assignment: DeliveryAssignment | null;
  open: boolean;
  onClose: () => void;
}

export function ZoneAssignmentEditor({ assignment, open, onClose }: ZoneAssignmentEditorProps) {
  const { state, handleDrop, removeAssignment } = useDeliveryPlanning();
  const { toast } = useToast();

  const [editedAssignment, setEditedAssignment] = useState<DeliveryAssignment | null>(assignment);
  const [newDate, setNewDate] = useState<Date | undefined>(assignment?.date);
  const [newTimeSlot, setNewTimeSlot] = useState(assignment?.timeSlot || '');

  // Generate time slot options (24-hour format)
  const timeSlotOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const displayHour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    return {
      value: hour.toString(),
      label: `${displayHour12} ${ampm} (${hour.toString().padStart(2, '0')}:00)`,
    };
  });

  React.useEffect(() => {
    if (assignment) {
      setEditedAssignment(assignment);
      setNewDate(assignment.date);
      setNewTimeSlot(assignment.timeSlot);
    }
  }, [assignment]);

  const handleSave = () => {
    if (!editedAssignment || !newDate) return;

    // If date or time changed, move the assignment
    if (newDate.getTime() !== editedAssignment.date.getTime() || newTimeSlot !== editedAssignment.timeSlot) {
      // Remove old assignment and create new one
      removeAssignment(editedAssignment.id);
      
      // Create updated assignment
      const updatedAssignment = {
        ...editedAssignment,
        date: newDate,
        timeSlot: newTimeSlot,
        id: `${format(newDate, 'yyyy-MM-dd')}-${newTimeSlot}-${Date.now()}`,
      };

      handleDrop(updatedAssignment, newDate, newTimeSlot);
    }

    toast({
      title: "Assignment updated",
      description: `Assignment moved to ${format(newDate, 'EEE dd')} ${newTimeSlot}:00`,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!editedAssignment) return;
    
    removeAssignment(editedAssignment.id);
    toast({
      title: "Assignment deleted",
      description: "The assignment has been removed",
    });
    
    onClose();
  };

  if (!editedAssignment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Edit Zone Assignment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Zone/Group Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: editedAssignment.zone?.color || editedAssignment.zoneGroup?.color }}
              />
              <span className="font-medium">
                {editedAssignment.zone?.name || editedAssignment.zoneGroup?.name}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {editedAssignment.deliveryCount} deliveries
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newDate ? format(newDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newDate}
                  onSelect={setNewDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <Label>Time Slot</Label>
            <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {timeSlotOptions.find(opt => opt.value === newTimeSlot)?.label}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeSlotOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Count */}
          <div className="space-y-2">
            <Label>Delivery Count</Label>
            <Input
              type="number"
              value={editedAssignment.deliveryCount}
              onChange={(e) =>
                setEditedAssignment(prev =>
                  prev ? { ...prev, deliveryCount: parseInt(e.target.value) || 0 } : null
                )
              }
              min="0"
            />
          </div>


          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}