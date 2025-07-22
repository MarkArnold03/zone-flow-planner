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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar with everything */}
      <div className="w-80 border-r bg-card shadow-lg">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-foreground">
            Leveransplanering
          </h2>
          <p className="text-xs text-muted-foreground">
            Dra zoner till tidsplatser
          </p>
        </div>

        {/* Week Navigation */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            >
              ←
            </Button>
            <span className="text-sm font-medium">
              {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            >
              →
            </Button>
          </div>
        </div>

        {/* Zones */}
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

        {/* Time Slots & Dates */}
        <div className="flex-1 overflow-y-auto">
          {timeSlots.map((slot) => (
            <div key={slot.id} className="border-b">
              <div className="p-3 bg-muted/30">
                <h4 className="text-sm font-semibold text-center">{slot.label}</h4>
              </div>
              <div className="grid grid-cols-7 gap-1 p-2">
                {weekDays.map((day) => (
                  <div
                    key={`${slot.id}-${format(day, 'yyyy-MM-dd')}`}
                    className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded p-1 text-center hover:border-muted-foreground/50 cursor-pointer"
                  >
                    <div className="text-xs font-medium">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(day, 'dd')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1">
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
          >
            <Background color="hsl(var(--border))" size={1} />
            <Controls position="bottom-right" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}