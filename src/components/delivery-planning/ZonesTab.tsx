import React, { useState } from 'react';
import { Plus, Edit, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { Zone } from '@/types/delivery-planning';

interface ZonesTabProps {
  searchQuery: string;
}

export function ZonesTab({ searchQuery }: ZonesTabProps) {
  const { state, addZone } = useDeliveryPlanning();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    color: '#3B82F6',
    postcodes: [] as string[],
    capacity: 50
  });

  const filteredZones = state.zones.filter(zone =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.postcodes.some(pc => pc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDragStart = (e: React.DragEvent, zone: Zone) => {
    e.dataTransfer.setData('zone', JSON.stringify(zone));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddZone = () => {
    if (newZone.name && newZone.postcodes.length > 0) {
      addZone({ ...newZone, orders: [] });
      setNewZone({ name: '', color: '#3B82F6', postcodes: [], capacity: 50 });
      setIsAddDialogOpen(false);
    }
  };

  const handlePostcodesChange = (value: string) => {
    const postcodes = value.split(',').map(pc => pc.trim()).filter(pc => pc.length > 0);
    setNewZone(prev => ({ ...prev, postcodes }));
  };

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Delivery Zones</h3>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Zone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="zone-name">Zone Name</Label>
                <Input
                  id="zone-name"
                  value={newZone.name}
                  onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., North London"
                />
              </div>
              <div>
                <Label htmlFor="zone-color">Color</Label>
                <Input
                  id="zone-color"
                  type="color"
                  value={newZone.color}
                  onChange={(e) => setNewZone(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="zone-postcodes">Postcodes (comma separated)</Label>
                <Input
                  id="zone-postcodes"
                  placeholder="e.g., N1, N2, N3"
                  onChange={(e) => handlePostcodesChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="zone-capacity">Daily Capacity</Label>
                <Input
                  id="zone-capacity"
                  type="number"
                  value={newZone.capacity}
                  onChange={(e) => setNewZone(prev => ({ ...prev, capacity: parseInt(e.target.value) || 50 }))}
                />
              </div>
              <Button onClick={handleAddZone} className="w-full">
                Add Zone
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Zone List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredZones.map((zone) => (
          <Card
            key={zone.id}
            className="cursor-move hover:shadow-md transition-shadow border-l-4 group"
            style={{ borderLeftColor: zone.color }}
            draggable
            onDragStart={(e) => handleDragStart(e, zone)}
          >
            <CardContent className="p-3">
              <div className="space-y-2">
                {/* Zone Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    <span className="font-medium text-sm">{zone.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>

                {/* Postcodes */}
                <div className="flex flex-wrap gap-1">
                  {zone.postcodes.slice(0, 3).map((postcode) => (
                    <Badge key={postcode} variant="outline" className="text-xs">
                      {postcode}
                    </Badge>
                  ))}
                  {zone.postcodes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{zone.postcodes.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Capacity */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Package className="h-3 w-3" />
                    <span>Capacity: {zone.capacity}</span>
                  </div>
                  <div className="px-2 py-1 bg-muted/50 rounded text-xs">
                    Drag to assign
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
        💡 Drag zones directly onto calendar time slots to create assignments
      </div>
    </div>
  );
}