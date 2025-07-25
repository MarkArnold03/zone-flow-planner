import React, { useState } from 'react';
import { Plus, Edit, Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { ZoneGroup } from '@/types/delivery-planning';

interface ZoneGroupsTabProps {
  searchQuery: string;
}

export function ZoneGroupsTab({ searchQuery }: ZoneGroupsTabProps) {
  const { state, addZoneGroup, getAvailableZoneGroups } = useDeliveryPlanning();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    color: '#EF4444',
    zones: [] as string[],
    description: ''
  });

  const filteredGroups = getAvailableZoneGroups().filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.zones.some(zoneId => 
      state.zones.find(z => z.id === zoneId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleDragStart = (e: React.DragEvent, group: ZoneGroup) => {
    e.dataTransfer.setData('zoneGroup', JSON.stringify(group));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddGroup = () => {
    if (newGroup.name && newGroup.zones.length > 0) {
      addZoneGroup(newGroup);
      setNewGroup({ name: '', color: '#EF4444', zones: [], description: '' });
      setIsAddDialogOpen(false);
    }
  };

  const handleZoneToggle = (zoneId: string, checked: boolean) => {
    setNewGroup(prev => ({
      ...prev,
      zones: checked 
        ? [...prev.zones, zoneId]
        : prev.zones.filter(id => id !== zoneId)
    }));
  };

  const getGroupZoneNames = (group: ZoneGroup) => {
    return group.zones.map(zoneId => {
      const zone = state.zones.find(z => z.id === zoneId);
      return zone?.name || zoneId;
    });
  };

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Zone Groups</h3>
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
              <DialogTitle>Create Zone Group</DialogTitle>
              <DialogDescription>
                Create a new zone group by selecting multiple zones to combine into a single manageable unit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., North Route"
                />
              </div>
              <div>
                <Label htmlFor="group-color">Color</Label>
                <Input
                  id="group-color"
                  type="color"
                  value={newGroup.color}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="group-description">Description (optional)</Label>
                <Input
                  id="group-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Route description..."
                />
              </div>
              <div>
                <Label>Select Zones</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                  {state.zones.map((zone) => (
                    <div key={zone.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`zone-${zone.id}`}
                        checked={newGroup.zones.includes(zone.id)}
                        onCheckedChange={(checked) => handleZoneToggle(zone.id, checked as boolean)}
                      />
                      <label 
                        htmlFor={`zone-${zone.id}`}
                        className="text-sm flex items-center space-x-2 cursor-pointer"
                      >
                         <div 
                           className="w-3 h-3 rounded-full border border-border/20"
                           style={{ backgroundColor: zone.color }}
                         />
                        <span>{zone.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddGroup} className="w-full" disabled={newGroup.zones.length === 0}>
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Group List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredGroups.map((group) => {
          const zoneNames = getGroupZoneNames(group);
          
          return (
            <Card
              key={group.id}
              className="cursor-move hover:shadow-md transition-shadow border-l-4 group"
              style={{ borderLeftColor: group.color }}
              draggable
              onDragStart={(e) => handleDragStart(e, group)}
            >
              <CardContent className="p-3">
                <div className="space-y-2">
                  {/* Group Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="font-medium text-sm">{group.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Group
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Description */}
                  {group.description && (
                    <p className="text-xs text-muted-foreground">{group.description}</p>
                  )}

                  {/* Zones in Group */}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>Zones ({zoneNames.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {zoneNames.slice(0, 3).map((zoneName, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {zoneName}
                        </Badge>
                      ))}
                      {zoneNames.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{zoneNames.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Drag Indicator */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Package className="h-3 w-3" />
                      <span>{zoneNames.length} zones</span>
                    </div>
                    <div className="px-2 py-1 bg-muted/50 rounded text-xs">
                      Drag as block
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
        💡 Groups allow you to assign multiple zones as a single unit
      </div>
    </div>
  );
}