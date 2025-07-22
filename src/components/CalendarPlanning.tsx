import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  addEdge, 
  Connection, 
  useNodesState, 
  useEdgesState,
  Background,
  Controls,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { format, startOfWeek, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ZoneNode } from './ZoneNode';
import { CalendarSlotNode } from './CalendarSlotNode';

const timeSlots = [
  { id: '08-12', label: '08:00 - 12:00' },
  { id: '12-16', label: '12:00 - 16:00' },
  { id: '16-20', label: '16:00 - 20:00' },
];

const zones = [
  { id: 'stockholm', name: 'Stockholm', color: '#3B82F6' },
  { id: 'goteborg', name: 'Göteborg', color: '#10B981' },
  { id: 'malmo', name: 'Malmö', color: '#8B5CF6' },
];

const nodeTypes = {
  zone: ZoneNode,
  calendarSlot: CalendarSlotNode,
};

export function CalendarPlanning() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { toast } = useToast();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        
        if (sourceNode?.type === 'zone' && targetNode?.type === 'calendarSlot') {
          const zoneName = sourceNode.data.name;
          const slotInfo = targetNode.data;
          
          toast({
            title: "Zone scheduled",
            description: `${zoneName} assigned to ${slotInfo.date} at ${slotInfo.timeSlot}`,
          });
          
          // Update the target node to show it's occupied
          setNodes(nodes => nodes.map(node => 
            node.id === params.target 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    assignedZone: zoneName,
                    zoneColor: sourceNode.data.color 
                  } 
                }
              : node
          ));
        }
      }
      setEdges((eds) => addEdge(params, eds));
    },
    [nodes, toast, setNodes]
  );

  // Initialize nodes
  React.useEffect(() => {
    const newNodes: Node[] = [];
    
    // Create zone nodes in sidebar
    zones.forEach((zone, index) => {
      newNodes.push({
        id: `zone-${zone.id}`,
        type: 'zone',
        position: { 
          x: 50, 
          y: 100 + index * 120 
        },
        data: {
          name: zone.name,
          color: zone.color,
          id: zone.id,
        },
        style: {
          width: 160,
          height: 80,
        },
      });
    });

    // Create calendar slot nodes (time slots as rows, dates as columns)
    timeSlots.forEach((slot, slotIndex) => {
      weekDays.forEach((day, dayIndex) => {
        const nodeId = `slot-${format(day, 'yyyy-MM-dd')}-${slot.id}`;
        newNodes.push({
          id: nodeId,
          type: 'calendarSlot',
          position: { 
            x: 300 + dayIndex * 140, 
            y: 80 + slotIndex * 120 
          },
          data: {
            date: format(day, 'MMM dd'),
            fullDate: format(day, 'yyyy-MM-dd'),
            timeSlot: slot.label,
            timeSlotId: slot.id,
            dayOfWeek: format(day, 'EEE'),
            assignedZone: null,
            zoneColor: null,
          },
          style: {
            width: 130,
            height: 100,
          },
        });
      });
    });

    setNodes(newNodes);
  }, [currentWeek, setNodes]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Zone Planning Calendar
              </h1>
              <p className="text-muted-foreground text-sm">
                Drag zones from sidebar to schedule deliveries
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
              >
                ← Previous
              </Button>
              <span className="text-sm font-medium min-w-[200px] text-center">
                {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid Headers */}
      <div className="bg-muted/30 border-b">
        <div className="flex">
          {/* Sidebar space */}
          <div className="w-[250px] p-4">
            <h3 className="font-semibold text-sm text-muted-foreground">DELIVERY ZONES</h3>
          </div>
          
          {/* Date headers */}
          <div className="flex-1">
            <div className="grid grid-cols-7 gap-1 p-4">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="text-center">
                  <div className="font-semibold text-sm">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'MMM dd')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time Slot Row Headers */}
      <div className="border-b bg-muted/10">
        <div className="flex">
          <div className="w-[250px]"></div>
          <div className="flex-1 p-2">
            {timeSlots.map((slot) => (
              <div key={slot.id} className="h-[120px] flex items-center">
                <div className="text-sm font-medium text-muted-foreground -rotate-90 whitespace-nowrap origin-center">
                  {slot.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ReactFlow Calendar */}
      <div className="flex-1" style={{ height: 'calc(100vh - 240px)' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView={false}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            style={{ backgroundColor: 'hsl(var(--background))' }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={true}
            nodesConnectable={true}
          >
            <Background color="hsl(var(--border))" size={1} />
            <Controls position="bottom-right" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}