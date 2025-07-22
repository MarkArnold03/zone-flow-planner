import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface TimeSlotNodeData {
  date: string;
  timeSlot: string;
  dayOfWeek: string;
}

interface TimeSlotNodeProps {
  data: TimeSlotNodeData;
}

export const TimeSlotNode = memo(({ data }: TimeSlotNodeProps) => {
  const { date, timeSlot, dayOfWeek } = data;
  
  return (
    <>
      <Card className="border border-border bg-card hover:bg-muted/50 transition-colors">
        <CardHeader className="p-2 pb-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span className="font-medium">{date}</span>
          </div>
        </CardHeader>
        <CardContent className="p-2 pt-1">
          <div className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3 text-primary" />
            <span className="font-medium">{timeSlot}</span>
          </div>
          <div className="mt-2 p-2 border-2 border-dashed border-border/50 rounded-md text-center">
            <span className="text-xs text-muted-foreground">
              Drop work order here
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: 'hsl(var(--muted-foreground))',
          width: 8,
          height: 8,
        }}
      />
    </>
  );
});