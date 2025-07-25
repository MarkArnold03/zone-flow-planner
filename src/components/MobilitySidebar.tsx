import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Truck, Car, Zap, Plus, Settings } from 'lucide-react';

const mobilityZones = [
  {
    id: 'priority',
    title: 'Prioriterade zoner',
    subtitle: 'Snabbast möjliga leverans',
    zones: [
      { id: 'express', name: 'Express', description: 'Samma dag leverans', icon: Zap, color: '#ef4444' }
    ]
  },
  {
    id: 'north',
    title: 'Norra Sverige',
    subtitle: 'Norrlands regioner',
    zones: [
      { id: 'stockholm', name: 'Stockholm', description: 'Storstockholm och närområde', icon: MapPin, color: '#3b82f6' },
      { id: 'uppsala', name: 'Uppsala', description: 'Uppsala län', icon: MapPin, color: '#f59e0b' }
    ]
  },
  {
    id: 'west',
    title: 'Västra Sverige',
    subtitle: 'Västkusten och Västra Götaland',
    zones: [
      { id: 'goteborg', name: 'Göteborg', description: 'Västra Götaland', icon: MapPin, color: '#10b981' }
    ]
  },
  {
    id: 'south',
    title: 'Södra Sverige',
    subtitle: 'Skåne och sydvästra regioner',
    zones: [
      { id: 'malmo', name: 'Malmö', description: 'Skåne och sydvästra Sverige', icon: MapPin, color: '#8b5cf6' }
    ]
  },
  {
    id: 'transport',
    title: 'Transportzoner',
    subtitle: 'Specialiserade transportlösningar',
    zones: [
      { id: 'electric', name: 'Elektrisk transport', description: 'Miljövänliga fordon', icon: Car, color: '#22c55e' },
      { id: 'heavy', name: 'Tunga transporter', description: 'Stora och tunga leveranser', icon: Truck, color: '#64748b' }
    ]
  }
];

const initialTrucks = [
  {
    id: 'truck-1',
    name: 'Lastbil 1',
    driver: 'Anna Andersson',
    zones: {
      '08-12': { id: 'stockholm', name: 'Stockholm', color: '#3b82f6' },
      '12-16': { id: 'goteborg', name: 'Göteborg', color: '#10b981' }
    }
  },
  {
    id: 'truck-2', 
    name: 'Lastbil 2',
    driver: 'Erik Eriksson',
    zones: {
      '08-12': { id: 'express', name: 'Express', color: '#ef4444' },
      '12-16': { id: 'malmo', name: 'Malmö', color: '#8b5cf6' }
    }
  },
  {
    id: 'truck-3',
    name: 'Elbil 1', 
    driver: 'Maria Nilsson',
    zones: {
      '08-12': { id: 'uppsala', name: 'Uppsala', color: '#f59e0b' },
      '12-16': { id: 'electric', name: 'Elektrisk transport', color: '#22c55e' }
    }
  }
];

const initialZoneGroups = [
  {
    id: 'group-1',
    name: 'Storstäder',
    zones: ['stockholm', 'goteborg', 'malmo'],
    color: '#6366f1'
  },
  {
    id: 'group-2', 
    name: 'Express rutt',
    zones: ['express', 'stockholm'],
    color: '#f43f5e'
  }
];

export function MobilitySidebar() {
  const [trucks, setTrucks] = useState(initialTrucks);
  const [zoneGroups, setZoneGroups] = useState(initialZoneGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'zones' | 'trucks' | 'groups'>('zones');
  const createZoneGroup = () => {
    if (newGroupName && selectedZones.length > 0) {
      const newGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        zones: selectedZones,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
      setZoneGroups([...zoneGroups, newGroup]);
      setNewGroupName('');
      setSelectedZones([]);
    }
  };

  const toggleZoneSelection = (zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  return (
    <div className="w-80 border-r bg-card shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-foreground">
          Leveransplanering
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Future Mobility
        </p>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          <Button 
            variant={activeTab === 'zones' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('zones')}
          >
            Zoner
          </Button>
          <Button 
            variant={activeTab === 'trucks' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('trucks')}
          >
            Fordon
          </Button>
          <Button 
            variant={activeTab === 'groups' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('groups')}
          >
            Grupper
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Zones Tab */}
        {activeTab === 'zones' && (
          <>
            {mobilityZones.map((category) => (
              <div key={category.id}>
                <div className="mb-3">
                  <h3 className="font-semibold text-foreground">{category.title}</h3>
                  <p className="text-xs text-muted-foreground">{category.subtitle}</p>
                </div>
                
                <div className="space-y-2">
                  {category.zones.map((zone) => (
                    <Card 
                      key={zone.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                        selectedZones.includes(zone.id) ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{ borderLeftColor: zone.color }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('zone', JSON.stringify(zone));
                      }}
                      onClick={() => toggleZoneSelection(zone.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: zone.color }}
                          >
                            <zone.icon className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground">
                              {zone.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {zone.description}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Trucks Tab */}
        {activeTab === 'trucks' && (
          <div>
            <div className="mb-3">
              <h3 className="font-semibold text-foreground">Leveransfordon</h3>
              <p className="text-xs text-muted-foreground">Dra fordon till kalender</p>
            </div>
            
            <div className="space-y-2">
              {trucks.map((truck) => (
                <Card 
                  key={truck.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('truck', JSON.stringify(truck));
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Truck className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          {truck.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {truck.driver}
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                            style={{ backgroundColor: truck.zones['08-12'].color + '20', color: truck.zones['08-12'].color }}
                          >
                            8-12: {truck.zones['08-12'].name}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                            style={{ backgroundColor: truck.zones['12-16'].color + '20', color: truck.zones['12-16'].color }}
                          >
                            12-16: {truck.zones['12-16'].name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Zone Groups Tab */}
        {activeTab === 'groups' && (
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">Zongrupper</h3>
              <p className="text-xs text-muted-foreground mb-3">Skapa återanvändbara zongrupper</p>
              
              {/* Create Group */}
              <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                <Input
                  placeholder="Gruppnamn"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Valda zoner: {selectedZones.length} 
                  {selectedZones.length > 0 && (
                    <span className="ml-1">
                      ({selectedZones.join(', ')})
                    </span>
                  )}
                </div>
                <Button 
                  size="sm" 
                  onClick={createZoneGroup}
                  disabled={!newGroupName || selectedZones.length === 0}
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Skapa grupp
                </Button>
              </div>
            </div>
            
            {/* Existing Groups */}
            <div className="space-y-2">
              {zoneGroups.map((group) => (
                <Card 
                  key={group.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                  style={{ borderLeftColor: group.color }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('zoneGroup', JSON.stringify(group));
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: group.color }}
                      >
                        <Settings className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          {group.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {group.zones.length} zoner: {group.zones.join(', ')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}