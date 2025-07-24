export interface Order {
  id: string;
  postcode: string;
  address: string;
  deliveryCount: number;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number;
  notes?: string;
}

export interface Zone {
  id: string;
  name: string;
  color: string;
  postcodes: string[];
  capacity: number;
  orders: Order[];
}

export interface ZoneGroup {
  id: string;
  name: string;
  color: string;
  zones: string[];
  description?: string;
}

export interface Worker {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  skills: string[];
}

export interface Truck {
  id: string;
  name: string;
  capacity: number;
  workers: Worker[];
  status: 'available' | 'assigned' | 'maintenance';
}

export interface TimeSlot {
  id: string;
  start: string; // "08:00"
  end: string;   // "12:00"
  label: string; // "Morning"
}

export interface DeliveryAssignment {
  id: string;
  date: Date;
  timeSlot: string;
  zone?: Zone;
  zoneGroup?: ZoneGroup;
  truck?: Truck;
  deliveryCount: number;
  postcodes: string[];
  notes?: string;
  status: 'planned' | 'assigned' | 'in-progress' | 'completed';
  conflicts?: ConflictType[];
}

export interface ConflictType {
  type: 'capacity_exceeded' | 'double_booking' | 'worker_conflict' | 'zone_overlap' | 'insufficient_time' | 'truck_unavailable';
  severity: 'low' | 'medium' | 'high';
  message: string;
  reason: string;
  suggestion?: string;
}

export interface CalendarNote {
  id: string;
  date: Date;
  timeSlot?: string;
  content: string;
  type: 'general' | 'warning' | 'info';
  position: { x: number; y: number };
}

export interface RouteStop {
  id: string;
  postcode: string;
  address: string;
  deliveryCount: number;
  estimatedDuration: number;
}

export interface Route {
  id: string;
  truckId: string;
  date: Date;
  timeSlot: string;
  stops: RouteStop[];
  totalDistance: number;
  estimatedDuration: number;
  optimized: boolean;
}

export interface PlanningState {
  currentDate: Date;
  viewMode: 'week' | 'month';
  assignments: DeliveryAssignment[];
  zones: Zone[];
  zoneGroups: ZoneGroup[];
  trucks: Truck[];
  notes: CalendarNote[];
  routes: Route[];
  filters: {
    truck?: string;
    zone?: string;
    worker?: string;
    postcode?: string;
  };
}

export interface DragData {
  type: 'zone' | 'zoneGroup' | 'truck' | 'assignment';
  data: Zone | ZoneGroup | Truck | DeliveryAssignment;
}

export interface ExportOptions {
  format: 'pdf' | 'excel';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeRoutes: boolean;
  includeNotes: boolean;
  groupByTruck: boolean;
}