import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarSlotNodeData {
  date: string;
  fullDate: string;
  timeSlot: string;
  timeSlotId: string;
  dayOfWeek: string;
  assignedZone: string | null;
  zoneColor: string | null;
}

interface CalendarSlotNodeProps {
  data: CalendarSlotNodeData;
}

export const CalendarSlotNode = memo(({ data }: CalendarSlotNodeProps) => {
  const { date, timeSlot, dayOfWeek, assignedZone, zoneColor } = data;
  
  return (
    <>
      <Card 
        className={`border-2 transition-all ${
          assignedZone 
            ? 'border-2 shadow-md' 
            : 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/50'
        }`}
        style={{ 
          borderColor: zoneColor || undefined,
          backgroundColor: zoneColor ? `${zoneColor}10` : undefined 
        }}
      >
        <CardContent className="p-2 text-center">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">
              {dayOfWeek}
            </div>
            <div className="text-sm font-semibold">
              {date}
            </div>
            
            {assignedZone ? (
              <div className="mt-2">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: zoneColor, color: 'white' }}
                >
                  {assignedZone}
                </Badge>
              </div>
            ) : (
              <div className="mt-2 p-2 border border-dashed border-muted-foreground/30 rounded text-xs text-muted-foreground">
                Drop zone here
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: assignedZone ? zoneColor : 'hsl(var(--muted-foreground))',
          width: 10,
          height: 10,
          border: '2px solid white',
        }}
      />
    </>
  );
});