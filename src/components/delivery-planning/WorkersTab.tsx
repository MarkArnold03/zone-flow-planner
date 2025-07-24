import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { Worker } from '@/types/delivery-planning';

interface WorkersTabProps {
  searchQuery: string;
}

export function WorkersTab({ searchQuery }: WorkersTabProps) {
  const { state } = useDeliveryPlanning();

  const filteredWorkers = state.workers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDragStart = (e: React.DragEvent, worker: Worker) => {
    e.dataTransfer.setData('worker', JSON.stringify(worker));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Workers</h3>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredWorkers.map((worker) => (
          <Card
            key={worker.id}
            className="cursor-move hover:shadow-md transition-shadow"
            draggable
            onDragStart={(e) => handleDragStart(e, worker)}
          >
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                  {worker.initials}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{worker.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {worker.skills.join(', ')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}