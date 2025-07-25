import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, MapPin, Package } from 'lucide-react';
import { Zone, Order } from '@/types/delivery-planning';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';

interface ZoneManagementProps {
  searchQuery: string;
}

export function ZoneManagement({ searchQuery }: ZoneManagementProps) {
  const { state, addZone, updateZone, removeZone, addOrderToZone, removeOrderFromZone, getAvailableZones } = useDeliveryPlanning();
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState<string | null>(null);
  const [showAllZones, setShowAllZones] = useState(false);
  
  const [newZone, setNewZone] = useState({
    name: '',
    color: '#3B82F6',
    postcodes: [] as string[],
    capacity: 50,
  });

  const [newOrder, setNewOrder] = useState({
    postcode: '',
    address: '',
    deliveryCount: 1,
    priority: 'medium' as const,
    estimatedDuration: 30,
    notes: '',
  });

  // Filter zones based on search and availability (zones not currently assigned)
  const filteredZones = getAvailableZones().filter(zone =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.postcodes.some(pc => pc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Show only 4 zones initially, unless "Show More" is clicked or search is active
  const displayedZones = showAllZones || searchQuery ? filteredZones : filteredZones.slice(0, 4);
  const hasMoreZones = filteredZones.length > 4 && !searchQuery;

  const handleDragStart = (e: React.DragEvent, zone: Zone) => {
    e.dataTransfer.setData('zone', JSON.stringify(zone));
  };

  const handleAddZone = () => {
    if (newZone.name && newZone.postcodes.length > 0) {
      addZone({ ...newZone, orders: [] });
      setNewZone({ name: '', color: '#3B82F6', postcodes: [], capacity: 50 });
      setShowAddZone(false);
    }
  };

  const handleUpdateZone = () => {
    if (editingZone) {
      updateZone(editingZone);
      setEditingZone(null);
    }
  };

  const handleAddOrder = (zoneId: string) => {
    if (newOrder.postcode && newOrder.address) {
      const order: Omit<Order, 'id'> = { ...newOrder };
      addOrderToZone(zoneId, order);
      setNewOrder({
        postcode: '',
        address: '',
        deliveryCount: 1,
        priority: 'medium',
        estimatedDuration: 30,
        notes: '',
      });
      setShowAddOrder(null);
    }
  };

  const handlePostcodesChange = (value: string, isEditing = false) => {
    const postcodes = value.split(',').map(pc => pc.trim()).filter(pc => pc.length > 0);
    if (isEditing && editingZone) {
      setEditingZone(prev => prev ? { ...prev, postcodes } : null);
    } else {
      setNewZone(prev => ({ ...prev, postcodes }));
    }
  };

  const getZoneOrders = (zone: Zone) => {
    // Get orders from zone + orders that match postcodes from assignments
    const assignmentOrders = state.assignments
      .filter(a => a.zone?.id === zone.id)
      .flatMap(a => a.postcodes.map(pc => ({ postcode: pc, source: 'assignment' })));
    
    return [...zone.orders, ...assignmentOrders];
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Zone button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Zone Management
        </h3>
        <Dialog open={showAddZone} onOpenChange={setShowAddZone}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Zone</DialogTitle>
              <DialogDescription>
                Create a new delivery zone with a name, color, capacity, and associated postcodes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="zone-name">Zone Name</Label>
                <Input
                  id="zone-name"
                  value={newZone.name}
                  onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter zone name"
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
                  placeholder="SE1, SE2, N1"
                  onChange={(e) => handlePostcodesChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="zone-capacity">Capacity</Label>
                <Input
                  id="zone-capacity"
                  type="number"
                  value={newZone.capacity}
                  onChange={(e) => setNewZone(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <Button onClick={handleAddZone} className="w-full">
                Add Zone
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Zone Cards */}
      <div className="space-y-3">
        {displayedZones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery 
                ? 'No zones match your search' 
                : 'All zones are currently assigned'
              }
            </p>
            {!searchQuery && (
              <p className="text-xs mt-1">
                Drag assignments back here to make zones available
              </p>
            )}
          </div>
        ) : (
          <>
        {displayedZones.map((zone) => {
          const zoneOrders = getZoneOrders(zone);
          
          return (
            <Card
              key={zone.id}
              className="hover:shadow-md transition-all duration-200 cursor-move border-l-4"
              style={{ borderLeftColor: zone.color }}
              draggable
              onDragStart={(e) => handleDragStart(e, zone)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    {zone.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingZone(zone)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Zone</DialogTitle>
                          <DialogDescription>
                            Modify the properties of this delivery zone.
                          </DialogDescription>
                        </DialogHeader>
                        {editingZone && (
                          <div className="space-y-4">
                            <div>
                              <Label>Zone Name</Label>
                              <Input
                                value={editingZone.name}
                                onChange={(e) => setEditingZone(prev => prev ? { ...prev, name: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <Label>Color</Label>
                              <Input
                                type="color"
                                value={editingZone.color}
                                onChange={(e) => setEditingZone(prev => prev ? { ...prev, color: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <Label>Postcodes</Label>
                              <Input
                                value={editingZone.postcodes.join(', ')}
                                onChange={(e) => handlePostcodesChange(e.target.value, true)}
                              />
                            </div>
                            <div>
                              <Label>Capacity</Label>
                              <Input
                                type="number"
                                value={editingZone.capacity}
                                onChange={(e) => setEditingZone(prev => prev ? { ...prev, capacity: parseInt(e.target.value) || 0 } : null)}
                              />
                            </div>
                            <Button onClick={handleUpdateZone} className="w-full">
                              Update Zone
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Zone</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{zone.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeZone(zone.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
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
                <div className="text-sm text-muted-foreground">
                  Capacity: {zone.capacity} deliveries
                </div>

                {/* Orders Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      Orders ({zoneOrders.length})
                    </span>
                    <Dialog open={showAddOrder === zone.id} onOpenChange={(open) => setShowAddOrder(open ? zone.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Order to {zone.name}</DialogTitle>
                          <DialogDescription>
                            Add a new delivery order to this zone with customer details and delivery information.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Postcode</Label>
                            <Input
                              value={newOrder.postcode}
                              onChange={(e) => setNewOrder(prev => ({ ...prev, postcode: e.target.value }))}
                              placeholder="Enter postcode"
                            />
                          </div>
                          <div>
                            <Label>Address</Label>
                            <Input
                              value={newOrder.address}
                              onChange={(e) => setNewOrder(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Enter full address"
                            />
                          </div>
                          <div>
                            <Label>Delivery Count</Label>
                            <Input
                              type="number"
                              value={newOrder.deliveryCount}
                              onChange={(e) => setNewOrder(prev => ({ ...prev, deliveryCount: parseInt(e.target.value) || 1 }))}
                            />
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Select
                              value={newOrder.priority}
                              onValueChange={(value) => setNewOrder(prev => ({ ...prev, priority: value as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Estimated Duration (minutes)</Label>
                            <Input
                              type="number"
                              value={newOrder.estimatedDuration}
                              onChange={(e) => setNewOrder(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 30 }))}
                            />
                          </div>
                          <Button onClick={() => handleAddOrder(zone.id)} className="w-full">
                            Add Order
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {zoneOrders.length > 0 && (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {zoneOrders.slice(0, 3).map((order, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                          <span>{order.postcode}</span>
                          {'id' in order && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOrderFromZone(zone.id, order.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {zoneOrders.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{zoneOrders.length - 3} more orders
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Show More/Show Less Button */}
        {hasMoreZones && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllZones(!showAllZones)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showAllZones ? 'Show Less' : `Show More (${filteredZones.length - 4} more)`}
            </Button>
          </div>
        )}
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded">
        💡 Drag zones to calendar slots to create assignments. Edit zones to manage orders and capacity.
      </div>
    </div>
  );
}