import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface ZoneNodeData {
  name: string;
  color: string;
  id: string;
}

interface ZoneNodeProps {
  data: ZoneNodeData;
}

export const ZoneNode = memo(({ data }: ZoneNodeProps) => {
  const { name, color, id } = data;
  
  return (
    <>
      <Card className="border-2 shadow-md cursor-move" style={{ borderColor: color }}>
        <CardContent className="p-4 text-center">
          <div className="space-y-2">
            <div 
              className="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">
                {name}
              </div>
              <Badge variant="outline" className="text-xs mt-1">
                Zone
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: color,
          width: 10,
          height: 10,
          border: '2px solid white',
        }}
      />
    </>
  );
});