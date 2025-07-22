import React, { useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
}

const timeSlots = [
  { id: '08-12', label: '08:00 - 12:00' },
  { id: '08-16', label: '08:00 - 16:00' },
  { id: '12-16', label: '12:00 - 16:00' }
];

export function BookingDialog({ isOpen, onClose, selectedDate }: BookingDialogProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('08-12');
  const [postnummer, setPostnummer] = useState('');
  const [antalLeveranser, setAntalLeveranser] = useState('1');
  const [anstallda, setAnstallda] = useState('');
  const [fordon, setFordon] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedDate) return;
    
    toast({
      title: "Bokning bekräftad",
      description: `Bokning för ${format(selectedDate, 'dd MMMM yyyy')} har skapats`,
    });
    
    // Reset form
    setPostnummer('');
    setAntalLeveranser('1');
    setAnstallda('');
    setFordon('');
    
    onClose();
  };

  const handleCancel = () => {
    // Reset form on cancel
    setPostnummer('');
    setAntalLeveranser('1');
    setAnstallda('');
    setFordon('');
    onClose();
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary">
            Bokning för tisdag {format(selectedDate, 'dd MMMM yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prioriterad zon info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h3 className="text-sm font-medium text-red-800 mb-1">Prioriterad zon</h3>
          </div>

          {/* Postnummer */}
          <div className="space-y-2">
            <Label htmlFor="postnummer">Postnummer</Label>
            <Input
              id="postnummer"
              placeholder="Ange postnummer (t.ex. 111 20)"
              value={postnummer}
              onChange={(e) => setPostnummer(e.target.value)}
            />
          </div>

          {/* Tid */}
          <div className="space-y-2">
            <Label>Välj tidsintervall</Label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeSlot(slot.id)}
                  className="text-xs"
                >
                  {slot.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Antal leveranser */}
          <div className="space-y-2">
            <Label htmlFor="antal">Antal leveranser</Label>
            <Input
              id="antal"
              type="number"
              min="1"
              value={antalLeveranser}
              onChange={(e) => setAntalLeveranser(e.target.value)}
            />
          </div>

          {/* Tilldela anställd */}
          <div className="space-y-2">
            <Label htmlFor="anstallda">Tilldela anställd</Label>
            <Select value={anstallda} onValueChange={setAnstallda}>
              <SelectTrigger>
                <SelectValue placeholder="Välj anställd" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anna">Anna Andersson</SelectItem>
                <SelectItem value="erik">Erik Eriksson</SelectItem>
                <SelectItem value="maria">Maria Larsson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tilldela fordon */}
          <div className="space-y-2">
            <Label htmlFor="fordon">Tilldela fordon</Label>
            <Select value={fordon} onValueChange={setFordon}>
              <SelectTrigger>
                <SelectValue placeholder="Välj fordon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electric1">Elektrisk skåpbil #1</SelectItem>
                <SelectItem value="electric2">Elektrisk skåpbil #2</SelectItem>
                <SelectItem value="truck1">Lastbil #1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Avbryt
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Bekräfta bokning
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}