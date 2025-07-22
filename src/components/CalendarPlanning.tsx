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
  MiniMap,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, Car, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { WorkOrderNode } from './WorkOrderNode';
import { TimeSlotNode } from './TimeSlotNode';

const timeSlots = [
  { id: '08-12', label: '08:00 - 12:00', value: 'morning' },
  { id: '12-16', label: '12:00 - 16:00', value: 'afternoon' },
  { id: '16-20', label: '16:00 - 20:00', value: 'evening' },
];

const zones = [
  { id: 'stockholm', name: 'Stockholm', color: 'bg-blue-100 text-blue-800' },
  { id: 'goteborg', name: 'Göteborg', color: 'bg-green-100 text-green-800' },
  { id: 'malmo', name: 'Malmö', color: 'bg-purple-100 text-purple-800' },
];

const cars = [
  { id: 'car-1', name: 'Volvo XC90 - ABC123', type: 'SUV' },
  { id: 'car-2', name: 'Volvo V60 - DEF456', type: 'Wagon' },
  { id: 'car-3', name: 'Tesla Model 3 - GHI789', type: 'Sedan' },
  { id: 'car-4', name: 'Volvo EX90 - JKL012', type: 'Electric SUV' },
];

const employees = [
  { id: 'emp-1', name: 'Erik Andersson', role: 'Driver' },
  { id: 'emp-2', name: 'Anna Larsson', role: 'Driver' },
  { id: 'emp-3', name: 'Magnus Olsson', role: 'Driver' },
  { id: 'emp-4', name: 'Sofia Johansson', role: 'Driver' },
  { id: 'emp-5', name: 'Oskar Nilsson', role: 'Helper' },
  { id: 'emp-6', name: 'Emma Karlsson', role: 'Helper' },
];

interface WorkOrder {
  id: string;
  zone: string;
  car: string;
  employees: string[];
  status: 'planned' | 'scheduled' | 'completed';
}

const nodeTypes = {
  workOrder: WorkOrderNode,
  timeSlot: TimeSlotNode,
};

export function CalendarPlanning() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'wo-1',
      zone: 'stockholm',
      car: 'car-1',
      employees: ['emp-1', 'emp-5'],
      status: 'planned',
    },
    {
      id: 'wo-2',
      zone: 'goteborg',
      car: 'car-2',
      employees: ['emp-2', 'emp-6'],
      status: 'planned',
    },
  ]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { toast } = useToast();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getZoneName = (id: string) => zones.find(zone => zone.id === id)?.name || '';
  const getCarName = (id: string) => cars.find(car => car.id === id)?.name || '';
  const getEmployeeName = (id: string) => employees.find(emp => emp.id === id)?.name || '';

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        // Handle work order assignment to time slot
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        
        if (sourceNode?.type === 'workOrder' && targetNode?.type === 'timeSlot') {
          toast({
            title: "Work order scheduled",
            description: `Work order assigned to ${targetNode.data.date} ${targetNode.data.timeSlot}`,
          });
        }
      }
      setEdges((eds) => addEdge(params, eds));
    },
    [nodes, toast]
  );

  // Initialize calendar grid nodes
  React.useEffect(() => {
    const calendarNodes: Node[] = [];
    const availableWorkOrderNodes: Node[] = [];
    
    // Create time slot nodes for calendar grid
    weekDays.forEach((day, dayIndex) => {
      timeSlots.forEach((slot, slotIndex) => {
        const nodeId = `timeslot-${format(day, 'yyyy-MM-dd')}-${slot.id}`;
        calendarNodes.push({
          id: nodeId,
          type: 'timeSlot',
          position: { 
            x: dayIndex * 200 + 50, 
            y: slotIndex * 150 + 100 
          },
          data: {
            date: format(day, 'MMM dd'),
            timeSlot: slot.label,
            dayOfWeek: format(day, 'EEEE'),
          },
          style: {
            width: 180,
            height: 120,
          },
        });
      });
    });

    // Create work order nodes in sidebar
    workOrders.forEach((order, index) => {
      availableWorkOrderNodes.push({
        id: order.id,
        type: 'workOrder',
        position: { 
          x: -250, 
          y: 100 + index * 140 
        },
        data: {
          workOrder: order,
          zone: getZoneName(order.zone),
          car: getCarName(order.car),
          employees: order.employees.map(getEmployeeName),
        },
        style: {
          width: 200,
          height: 120,
        },
      });
    });

    setNodes([...calendarNodes, ...availableWorkOrderNodes]);
  }, [currentWeek, workOrders]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Delivery Calendar Planning
              </h1>
              <p className="text-muted-foreground mt-2">
                Drag work orders onto the calendar to schedule deliveries
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
              >
                Previous Week
              </Button>
              <span className="text-lg font-medium">
                {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
              >
                Next Week
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-7 gap-4 ml-64">
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="text-center py-2">
                <div className="font-semibold text-foreground">
                  {format(day, 'EEEE')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(day, 'MMM dd')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ReactFlow Calendar */}
      <div className="flex-1" style={{ height: 'calc(100vh - 200px)' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView={false}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            style={{ backgroundColor: 'hsl(var(--background))' }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="hsl(var(--border))" />
            <Controls />
            <MiniMap 
              style={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      
      {/* Legend */}
      <div className="border-t bg-card p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/20 border border-primary rounded"></div>
              <span>Available Work Orders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted border border-border rounded"></div>
              <span>Time Slots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success/20 border border-success rounded"></div>
              <span>Scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}