import { useState, useCallback, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  PlanningState,
  DeliveryAssignment,
  Zone,
  ZoneGroup,
  Worker,
  CalendarNote,
  ConflictType,
  DragData,
  TimeSlot,
  Order
} from '@/types/delivery-planning';

// Default data
const defaultZones: Zone[] = [
  // Stockholm
  { id: 'stb-fm', name: 'STB FM', color: '#0078D4', postcodes: ['111', '112', '113'], capacity: 50, orders: [] },
  { id: 'stb-em', name: 'STB EM', color: '#106EBE', postcodes: ['114', '115', '116'], capacity: 45, orders: [] },
  
  // Malmö
  { id: 'malmo-fm', name: 'Malmö FM', color: '#00BCF2', postcodes: ['211', '212', '213'], capacity: 40, orders: [] },
  { id: 'malmo-em', name: 'Malmö EM', color: '#0099BC', postcodes: ['214', '215', '216'], capacity: 40, orders: [] },
  { id: 'malmo-zon1', name: 'Malmö Zon1', color: '#40E0D0', postcodes: ['217', '218'], capacity: 35, orders: [] },
  { id: 'malmo-zon2', name: 'Malmö Zon2', color: '#48CAE4', postcodes: ['219', '220'], capacity: 35, orders: [] },
  { id: 'malmo-zon3', name: 'Malmö Zon3', color: '#0077BE', postcodes: ['221', '222'], capacity: 35, orders: [] },
  
  // Mellansverige
  { id: 'mellansverige', name: 'Mellansverige', color: '#FFA500', postcodes: ['601', '602', '603'], capacity: 60, orders: [] },
  { id: 'ms-zon1', name: 'M.S. Zon1', color: '#FF8C00', postcodes: ['604', '605'], capacity: 30, orders: [] },
  { id: 'ms-zon2', name: 'M.S. Zon2', color: '#FF7F50', postcodes: ['606', '607'], capacity: 30, orders: [] },
  { id: 'ms-zon3', name: 'M.S. Zon3', color: '#FF6347', postcodes: ['608', '609'], capacity: 30, orders: [] },
  
  // Göteborg
  { id: 'goteborg-zon1', name: 'Göteborg Zon1', color: '#32CD32', postcodes: ['401', '402'], capacity: 35, orders: [] },
  { id: 'goteborg-zon2', name: 'Göteborg Zon2', color: '#228B22', postcodes: ['403', '404'], capacity: 35, orders: [] },
  { id: 'goteborg-zon3', name: 'Göteborg Zon3', color: '#006400', postcodes: ['405', '406'], capacity: 35, orders: [] },
  { id: 'goteborg-zon4', name: 'Göteborg Zon4', color: '#9ACD32', postcodes: ['407', '408'], capacity: 35, orders: [] },
  
  // Norge
  { id: 'norge-zon1', name: 'Norge Zon1', color: '#8B0000', postcodes: ['501', '502'], capacity: 30, orders: [] },
  { id: 'norge-zon2', name: 'Norge Zon2', color: '#B22222', postcodes: ['503', '504'], capacity: 30, orders: [] },
  { id: 'norge-zon3', name: 'Norge Zon3', color: '#DC143C', postcodes: ['505', '506'], capacity: 30, orders: [] },
  { id: 'norge-zon4', name: 'Norge Zon4', color: '#FF1493', postcodes: ['507', '508'], capacity: 30, orders: [] },
  
  // Danmark
  { id: 'danmark-zon1', name: 'Danmark Zon1', color: '#800080', postcodes: ['301', '302'], capacity: 30, orders: [] },
  { id: 'danmark-zon2', name: 'Danmark Zon2', color: '#9370DB', postcodes: ['303', '304'], capacity: 30, orders: [] },
  { id: 'danmark-zon3', name: 'Danmark Zon3', color: '#8A2BE2', postcodes: ['305', '306'], capacity: 30, orders: [] },
  { id: 'danmark-zon4', name: 'Danmark Zon4', color: '#9932CC', postcodes: ['307', '308'], capacity: 30, orders: [] },
];

const defaultZoneGroups: ZoneGroup[] = [
  { id: 'stockholm-group', name: 'Stockholm', color: '#0078D4', zones: ['stb-fm', 'stb-em'] },
  { id: 'malmo-group', name: 'Malmö Region', color: '#00BCF2', zones: ['malmo-fm', 'malmo-em', 'malmo-zon1', 'malmo-zon2', 'malmo-zon3'] },
  { id: 'mellansverige-group', name: 'Mellansverige Region', color: '#FFA500', zones: ['mellansverige', 'ms-zon1', 'ms-zon2', 'ms-zon3'] },
  { id: 'goteborg-group', name: 'Göteborg Region', color: '#32CD32', zones: ['goteborg-zon1', 'goteborg-zon2', 'goteborg-zon3', 'goteborg-zon4'] },
  { id: 'norge-group', name: 'Norge', color: '#8B0000', zones: ['norge-zon1', 'norge-zon2', 'norge-zon3', 'norge-zon4'] },
  { id: 'danmark-group', name: 'Danmark', color: '#800080', zones: ['danmark-zon1', 'danmark-zon2', 'danmark-zon3', 'danmark-zon4'] },
];

const defaultWorkers: Worker[] = [
  { id: 'w1', name: 'John Smith', initials: 'JS', skills: ['driver'] },
  { id: 'w2', name: 'Maria Garcia', initials: 'MG', skills: ['helper'] },
  { id: 'w3', name: 'David Chen', initials: 'DC', skills: ['driver'] },
  { id: 'w4', name: 'Sarah Wilson', initials: 'SW', skills: ['helper'] },
  { id: 'w5', name: 'Mike Johnson', initials: 'MJ', skills: ['driver'] },
  { id: 'w6', name: 'Lisa Brown', initials: 'LB', skills: ['helper'] },
];

// Updated time slots for 5 AM to 11 PM (23:00)
export const timeSlots: TimeSlot[] = Array.from({ length: 19 }, (_, i) => {
  const hour = i + 5;
  return {
    id: `${hour}`,
    start: `${hour.toString().padStart(2, '0')}:00`,
    end: `${(hour + 1).toString().padStart(2, '0')}:00`,
    label: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`
  };
});

export function useDeliveryPlanning() {
  const { toast } = useToast();
  
  const [state, setState] = useState<PlanningState>({
    currentDate: new Date(),
    viewMode: 'week',
    assignments: [],
    zones: defaultZones,
    zoneGroups: defaultZoneGroups,
    workers: defaultWorkers,
    notes: [],
    routes: [],
    filters: {},
  });

  // Get week days for current date
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(state.currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [state.currentDate]);

  // Conflict detection
  const detectConflicts = useCallback((assignment: DeliveryAssignment): ConflictType[] => {
    const conflicts: ConflictType[] = [];
    
    // Check for double booking (worker conflicts)
    const existingAssignments = state.assignments.filter(a => 
      isSameDay(a.date, assignment.date) && 
      a.timeSlot === assignment.timeSlot &&
      a.workers?.some(worker => assignment.workers?.some(w => w.id === worker.id))
    );
    
    if (existingAssignments.length > 0) {
      conflicts.push({
        type: 'double_booking',
        severity: 'high',
        message: 'Worker already assigned to this time slot',
        reason: 'One or more workers are already assigned to another zone/group during this time period',
        suggestion: 'Choose different workers or time slot'
      });
    }

    // Check capacity exceeded
    if (assignment.zone && assignment.deliveryCount > assignment.zone.capacity) {
      conflicts.push({
        type: 'capacity_exceeded',
        severity: 'medium',
        message: `Delivery count exceeds zone capacity (${assignment.zone.capacity})`,
        reason: `Delivery count (${assignment.deliveryCount}) exceeds zone capacity (${assignment.zone.capacity})`,
        suggestion: 'Reduce delivery count or increase zone capacity'
      });
    }

    return conflicts;
  }, [state.assignments]);

  // Enhanced handle drop to support assignment moving
  const handleDrop = useCallback((
    dragData: DragData | DeliveryAssignment,
    date: Date,
    timeSlot: string
  ) => {
    // Check if it's an existing assignment being moved
    if ('date' in dragData && 'timeSlot' in dragData) {
      const assignment = dragData as DeliveryAssignment;
      
      // Update the assignment's date and time slot
      setState(prev => ({
        ...prev,
        assignments: prev.assignments.map(a => 
          a.id === assignment.id 
            ? { ...a, date, timeSlot }
            : a
        )
      }));

      toast({
        title: "Assignment moved",
        description: `Assignment moved to ${format(date, 'EEE dd')} ${timeSlot}:00`,
      });
      return;
    }

    // Handle new zone/group/worker drops (existing logic)
    const data = dragData as DragData;
    const assignmentId = `${format(date, 'yyyy-MM-dd')}-${timeSlot}-${Date.now()}`;
    
    let newAssignment: DeliveryAssignment;

    switch (data.type) {
      case 'zone':
        const zone = data.data as Zone;
        newAssignment = {
          id: assignmentId,
          date,
          timeSlot,
          startHour: data.startHour,
          endHour: data.endHour,
          zone,
          deliveryCount: Math.floor(zone.capacity * 0.8),
          postcodes: zone.postcodes,
          status: 'planned'
        };
        break;

      case 'zoneGroup':
        const zoneGroup = data.data as ZoneGroup;
        newAssignment = {
          id: assignmentId,
          date,
          timeSlot,
          startHour: data.startHour,
          endHour: data.endHour,
          zoneGroup,
          deliveryCount: 25,
          postcodes: [],
          status: 'planned'
        };
        break;

      case 'worker':
        const worker = data.data as Worker;
        newAssignment = {
          id: assignmentId,
          date,
          timeSlot,
          startHour: data.startHour,
          endHour: data.endHour,
          workers: [worker],
          deliveryCount: 0,
          postcodes: [],
          status: 'assigned'
        };
        break;

      default:
        return;
    }

    const conflicts = detectConflicts(newAssignment);
    newAssignment.conflicts = conflicts;

    setState(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment]
    }));

    if (conflicts.length > 0) {
      toast({
        title: "Assignment created with conflicts",
        description: `${conflicts.length} conflict(s) detected`,
        variant: "destructive"
      });
    } else {
      const hourRange = data.startHour && data.endHour ? ` ${data.startHour}:00-${data.endHour}:00` : ` ${timeSlot}:00`;
      toast({
        title: "Assignment created",
        description: `Assignment created for ${format(date, 'EEE dd')}${hourRange}`,
      });
    }
  }, [detectConflicts, toast]);

  // Smart assignment
  const smartAssign = useCallback((postcodes: string[], date: Date, timeSlot: string) => {
    // Find best zone based on postcodes
    const bestZone = state.zones.find(zone => 
      postcodes.some(pc => zone.postcodes.some(zpc => pc.startsWith(zpc)))
    );

    // Find available workers
    const availableWorkers = state.workers.filter(worker => 
      !state.assignments.some(a => 
        isSameDay(a.date, date) && 
        a.timeSlot === timeSlot && 
        a.workers?.some(w => w.id === worker.id)
      )
    );

    if (bestZone && availableWorkers.length > 0) {
      const assignment: DeliveryAssignment = {
        id: `smart-${format(date, 'yyyy-MM-dd')}-${timeSlot}-${Date.now()}`,
        date,
        timeSlot,
        zone: bestZone,
        workers: availableWorkers.slice(0, 2), // Assign up to 2 workers
        deliveryCount: postcodes.length,
        postcodes,
        status: 'assigned'
      };

      setState(prev => ({
        ...prev,
        assignments: [...prev.assignments, assignment]
      }));

      toast({
        title: "Smart assignment created",
        description: `${postcodes.length} deliveries assigned to ${bestZone.name}`,
      });
    }
  }, [state.zones, state.workers, state.assignments, toast]);

  // Update state functions
  const updateDate = useCallback((date: Date) => {
    setState(prev => ({ ...prev, currentDate: date }));
  }, []);

  const updateViewMode = useCallback((viewMode: 'week' | 'month') => {
    setState(prev => ({ ...prev, viewMode }));
  }, []);

  const updateFilters = useCallback((filters: Partial<PlanningState['filters']>) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
  }, []);

  const addZone = useCallback((zone: Omit<Zone, 'id'>) => {
    const newZone: Zone = { ...zone, id: `zone-${Date.now()}` };
    setState(prev => ({ ...prev, zones: [...prev.zones, newZone] }));
    toast({ title: "Zone added", description: `${zone.name} has been added` });
  }, [toast]);

  const updateZone = useCallback((updatedZone: Zone) => {
    setState(prev => ({
      ...prev,
      zones: prev.zones.map(zone => 
        zone.id === updatedZone.id ? updatedZone : zone
      ),
    }));
    toast({ title: "Zone updated", description: `${updatedZone.name} has been updated` });
  }, [toast]);

  const removeZone = useCallback((zoneId: string) => {
    setState(prev => ({
      ...prev,
      zones: prev.zones.filter(zone => zone.id !== zoneId),
      assignments: prev.assignments.filter(assignment => assignment.zone?.id !== zoneId),
    }));
    toast({ title: "Zone removed" });
  }, [toast]);

  const addOrderToZone = useCallback((zoneId: string, order: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
    };
    setState(prev => ({
      ...prev,
      zones: prev.zones.map(zone =>
        zone.id === zoneId
          ? { ...zone, orders: [...zone.orders, newOrder] }
          : zone
      ),
    }));
    toast({ title: "Order added", description: `Order added to zone` });
  }, [toast]);

  const removeOrderFromZone = useCallback((zoneId: string, orderId: string) => {
    setState(prev => ({
      ...prev,
      zones: prev.zones.map(zone =>
        zone.id === zoneId
          ? { ...zone, orders: zone.orders.filter(order => order.id !== orderId) }
          : zone
      ),
    }));
    toast({ title: "Order removed" });
  }, [toast]);

  const addZoneGroup = useCallback((group: Omit<ZoneGroup, 'id'>) => {
    const newGroup: ZoneGroup = { ...group, id: `group-${Date.now()}` };
    setState(prev => ({ ...prev, zoneGroups: [...prev.zoneGroups, newGroup] }));
    toast({ title: "Zone group added", description: `${group.name} has been added` });
  }, [toast]);

  const addNote = useCallback((note: Omit<CalendarNote, 'id'>) => {
    const newNote: CalendarNote = { ...note, id: `note-${Date.now()}` };
    setState(prev => ({ ...prev, notes: [...prev.notes, newNote] }));
  }, []);

  const removeAssignment = useCallback((assignmentId: string) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.id !== assignmentId)
    }));
    toast({ title: "Assignment removed" });
  }, [toast]);

  // Get assignments for a specific date and time slot
  const getAssignments = useCallback((date: Date, timeSlot: string) => {
    return state.assignments.filter(a => 
      isSameDay(a.date, date) && a.timeSlot === timeSlot
    );
  }, [state.assignments]);

  // Get available zones (not currently assigned)
  const getAvailableZones = useCallback(() => {
    const assignedZoneIds = new Set(
      state.assignments
        .filter(a => a.zone)
        .map(a => a.zone!.id)
    );
    return state.zones.filter(zone => !assignedZoneIds.has(zone.id));
  }, [state.zones, state.assignments]);

  // Get available zone groups (not currently assigned)
  const getAvailableZoneGroups = useCallback(() => {
    const assignedGroupIds = new Set(
      state.assignments
        .filter(a => a.zoneGroup)
        .map(a => a.zoneGroup!.id)
    );
    return state.zoneGroups.filter(group => !assignedGroupIds.has(group.id));
  }, [state.zoneGroups, state.assignments]);

  // Get filtered assignments
  const filteredAssignments = useMemo(() => {
    return state.assignments.filter(assignment => {
      if (state.filters.zone && assignment.zone?.id !== state.filters.zone) return false;
      if (state.filters.worker && !assignment.workers?.some(w => w.id === state.filters.worker)) return false;
      if (state.filters.postcode && !assignment.postcodes.some(pc => pc.includes(state.filters.postcode!))) return false;
      return true;
    });
  }, [state.assignments, state.filters]);

  return {
    state,
    weekDays,
    timeSlots,
    handleDrop,
    smartAssign,
    updateDate,
    updateViewMode,
    updateFilters,
    addZone,
    updateZone,
    removeZone,
    addOrderToZone,
    removeOrderFromZone,
    addZoneGroup,
    addNote,
    removeAssignment,
    getAssignments,
    getAvailableZones,
    getAvailableZoneGroups,
    filteredAssignments,
    detectConflicts,
  };
}
