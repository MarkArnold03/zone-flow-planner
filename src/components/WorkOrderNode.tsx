import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Car, Users } from 'lucide-react';

interface WorkOrderNodeData {
  workOrder: {
    id: string;
    zone: string;
    car: string;
    employees: string[];
    status: 'planned' | 'scheduled' | 'completed';
  };
  zone: string;
  car: string;
  employees: string[];
}

interface WorkOrderNodeProps {
  data: WorkOrderNodeData;
}

export const WorkOrderNode = memo(({ data }: WorkOrderNodeProps) => {
  const { workOrder, zone, car, employees } = data;
  
  return (
    <>
      <Card className="border-2 border-primary/50 bg-primary/5 shadow-md">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Work Order
            </Badge>
            <Badge 
              variant={workOrder.status === 'planned' ? 'secondary' : 'default'}
              className="text-xs"
            >
              {workOrder.status}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="font-medium truncate">{zone}</span>
            </div>
            
            <div className="flex items-center gap-1 text-xs">
              <Car className="h-3 w-3 text-primary" />
              <span className="truncate">{car.split(' - ')[0]}</span>
            </div>
            
            <div className="flex items-center gap-1 text-xs">
              <Users className="h-3 w-3 text-primary" />
              <div className="flex flex-col gap-0.5">
                {employees.map((emp, index) => (
                  <span key={index} className="truncate text-xs">
                    {emp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: 'hsl(var(--primary))',
          width: 8,
          height: 8,
        }}
      />
    </>
  );
});