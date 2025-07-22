import React from 'react';

const zones = [
  { id: 'stockholm', name: 'Stockholm', color: '#3B82F6' },
  { id: 'goteborg', name: 'Göteborg', color: '#10B981' },
  { id: 'malmo', name: 'Malmö', color: '#8B5CF6' },
];

export function ZoneList() {
  return (
    <div className="p-4 border-b">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">ZONER</h3>
      <div className="space-y-2">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="p-3 border-2 rounded-lg cursor-move shadow-sm"
            style={{ borderColor: zone.color }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: zone.color }}
              ></div>
              <span className="font-medium text-sm">{zone.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}