import React, { useState } from 'react';
import { Plus, Edit, Truck, Users, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { Truck as TruckType, Worker } from '@/types/delivery-planning';

interface TrucksTabProps {
  searchQuery: string;
}

export function TrucksTab({ searchQuery }: TrucksTabProps) {
  const { state } = useDeliveryPlanning();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredTrucks = state.trucks.filter(truck =>
    truck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    truck.workers.some(worker => 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleDragStart = (e: React.DragEvent, truck: TruckType) => {
    e.dataTransfer.setData('truck', JSON.stringify(truck));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const getStatusIcon = (status: TruckType['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'assigned':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'maintenance':
        return <Wrench className="h-3 w-3 text-red-500" />;
    }
  };

  const getStatusColor = (status: TruckType['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Trucks & Workers</h3>
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
              <DialogTitle>Add New Truck</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="truck-name">Truck Name</Label>
                <Input
                  id="truck-name"
                  placeholder="e.g., Truck 04"
                />
              </div>
              <div>
                <Label htmlFor="truck-capacity">Capacity</Label>
                <Input
                  id="truck-capacity"
                  type="number"
                  placeholder="100"
                />
              </div>
              <Button className="w-full">
                Add Truck
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Truck List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredTrucks.map((truck) => (
          <Card
            key={truck.id}
            className="cursor-move hover:shadow-md transition-shadow group"
            draggable
            onDragStart={(e) => handleDragStart(e, truck)}
          >
            <CardContent className="p-3">
              <div className="space-y-3">
                {/* Truck Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{truck.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${getStatusColor(truck.status)}`}>
                      {getStatusIcon(truck.status)}
                      <span className="capitalize">{truck.status}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Workers */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Crew ({truck.workers.length}/2):</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {truck.workers.map((worker) => (
                      <div 
                        key={worker.id}
                        className="flex items-center space-x-2 p-2 bg-muted/30 rounded"
                      >
                        <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                          {worker.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{worker.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {worker.skills.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {truck.workers.length < 2 && (
                      <div className="flex items-center justify-center p-2 border-2 border-dashed border-muted-foreground/30 rounded">
                        <span className="text-xs text-muted-foreground">Empty</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Capacity & Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <span>Capacity: {truck.capacity}</span>
                    <span>•</span>
                    <span>Workers: {truck.workers.length}/2</span>
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

      {/* Available Workers Pool */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <h4 className="text-sm font-medium">Available Workers</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* This would show unassigned workers */}
          <div className="p-2 border border-dashed border-muted-foreground/30 rounded text-center">
            <div className="w-6 h-6 bg-muted/50 rounded-full mx-auto mb-1"></div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
        💡 Drag entire truck teams to assign them to time slots
      </div>
    </div>
  );
}