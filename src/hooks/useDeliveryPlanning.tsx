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
  { id: 'fm', name: 'FM', color: '#3B82F6', postcodes: ['SE1', 'SE2'], capacity: 50, orders: [] },
  { id: 'em', name: 'EM', color: '#10B981', postcodes: ['E1', 'E2'], capacity: 45, orders: [] },
  { id: 'zon1', name: 'Zon1', color: '#8B5CF6', postcodes: ['N1', 'N2'], capacity: 40, orders: [] },
  { id: 'zon2', name: 'Zon2', color: '#F59E0B', postcodes: ['W1', 'W2'], capacity: 35, orders: [] },
];

const defaultZoneGroups: ZoneGroup[] = [
  { id: 'north-route', name: 'North Route', color: '#EF4444', zones: ['fm', 'zon1'] },
  { id: 'city-east', name: 'City East', color: '#06B6D4', zones: ['em', 'zon2'] },
];

const defaultWorkers: Worker[] = [
  { id: 'w1', name: 'John Smith', initials: 'JS', skills: ['driver'] },
  { id: 'w2', name: 'Maria Garcia', initials: 'MG', skills: ['helper'] },
  { id: 'w3', name: 'David Chen', initials: 'DC', skills: ['driver'] },
  { id: 'w4', name: 'Sarah Wilson', initials: 'SW', skills: ['helper'] },
  { id: 'w5', name: 'Mike Johnson', initials: 'MJ', skills: ['driver'] },
  { id: 'w6', name: 'Lisa Brown', initials: 'LB', skills: ['helper'] },
];

// Trucks removed - workers are now managed directly

export const timeSlots: TimeSlot[] = [
  { id: 'morning', start: '08:00', end: '12:00', label: 'Morning (08:00-12:00)' },
  { id: 'afternoon', start: '12:00', end: '16:00', label: 'Afternoon (12:00-16:00)' },
];

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

  // Handle drop operations
  const handleDrop = useCallback((
    dragData: DragData,
    date: Date,
    timeSlot: string
  ) => {
    const assignmentId = `${format(date, 'yyyy-MM-dd')}-${timeSlot}-${Date.now()}`;
    
    let newAssignment: DeliveryAssignment;

    switch (dragData.type) {
      case 'zone':
        const zone = dragData.data as Zone;
        newAssignment = {
          id: assignmentId,
          date,
          timeSlot,
          zone,
          deliveryCount: Math.floor(zone.capacity * 0.8), // 80% of capacity
          postcodes: zone.postcodes,
          status: 'planned'
        };
        break;

      case 'zoneGroup':
        const zoneGroup = dragData.data as ZoneGroup;
        newAssignment = {
          id: assignmentId,
          date,
          timeSlot,
          zoneGroup,
          deliveryCount: 25,
          postcodes: [],
          status: 'planned'
        };
        break;

      case 'worker':
        const worker = dragData.data as Worker;
        newAssignment = {
          id: assignmentId,
          date,
          timeSlot,
          workers: [worker],
          deliveryCount: 0,
          postcodes: [],
          status: 'assigned'
        };
        break;

      default:
        return;
    }

    // Detect conflicts
    const conflicts = detectConflicts(newAssignment);
    newAssignment.conflicts = conflicts;

    setState(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment]
    }));

    // Show feedback
    if (conflicts.length > 0) {
      toast({
        title: "Assignment created with conflicts",
        description: `${conflicts.length} conflict(s) detected`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Assignment created",
        description: `Assignment created for ${format(date, 'EEE dd')} ${timeSlot}`,
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
    filteredAssignments,
    detectConflicts,
  };
}