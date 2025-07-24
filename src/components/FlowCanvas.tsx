import React, { useCallback, useEffect } from 'react';
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
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ZoneNode } from './ZoneNode';
import { CalendarSlotNode } from './CalendarSlotNode';

const timeSlots = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 5;
  return {
    id: `${hour}`,
    label: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
  };
});

const zones = [
  { id: 'stockholm', name: 'Stockholm', color: '#3B82F6' },
  { id: 'goteborg', name: 'Göteborg', color: '#10B981' },
  { id: 'malmo', name: 'Malmö', color: '#8B5CF6' },
];

const nodeTypes = {
  zone: ZoneNode,
  calendarSlot: CalendarSlotNode,
};

interface FlowCanvasProps {
  weekDays: Date[];
}

export function FlowCanvas({ weekDays }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { toast } = useToast();

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

  useEffect(() => {
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

    // Create calendar slot nodes with new time range
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
  }, [weekDays, setNodes]);

  return (
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
  );
}
