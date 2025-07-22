import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Car, Zap } from 'lucide-react';

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
    id: 'regional',
    title: 'Regionala zoner', 
    subtitle: 'Större städer och regioner',
    zones: [
      { id: 'stockholm', name: 'Stockholm', description: 'Storstockholm och närområde', icon: MapPin, color: '#3b82f6' },
      { id: 'goteborg', name: 'Göteborg', description: 'Västra Götaland', icon: MapPin, color: '#10b981' },
      { id: 'malmo', name: 'Malmö', description: 'Skåne och sydvästra Sverige', icon: MapPin, color: '#8b5cf6' },
      { id: 'uppsala', name: 'Uppsala', description: 'Uppsala län', icon: MapPin, color: '#f59e0b' }
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

export function MobilitySidebar() {
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
      </div>

      {/* Zone Categories */}
      <div className="p-4 space-y-6">
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
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                  style={{ borderLeftColor: zone.color }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: zone.color }}
                      >
                        <zone.icon className="h-4 w-4 text-white" />
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
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t mt-auto">
        <div className="space-y-2">
          <button className="w-full text-left text-sm text-primary hover:underline">
            Resurser
          </button>
          <button className="w-full text-left text-sm text-primary hover:underline">
            Anställda
          </button>
        </div>
      </div>
    </div>
  );
}