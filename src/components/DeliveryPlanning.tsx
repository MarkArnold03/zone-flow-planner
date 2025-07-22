import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Car, Users, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  { id: 'emp-1', name: 'Erik Andersson', role: 'Driver', experience: '5 years' },
  { id: 'emp-2', name: 'Anna Larsson', role: 'Driver', experience: '3 years' },
  { id: 'emp-3', name: 'Magnus Olsson', role: 'Driver', experience: '7 years' },
  { id: 'emp-4', name: 'Sofia Johansson', role: 'Driver', experience: '4 years' },
  { id: 'emp-5', name: 'Oskar Nilsson', role: 'Helper', experience: '2 years' },
  { id: 'emp-6', name: 'Emma Karlsson', role: 'Helper', experience: '1 year' },
];

interface WorkOrder {
  id: string;
  date: Date;
  timeSlot: string;
  zone: string;
  car: string;
  employees: string[];
  status: 'planned' | 'confirmed' | 'completed';
}

export function DeliveryPlanning() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const { toast } = useToast();

  const handleEmployeeSelect = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    } else if (selectedEmployees.length < 2) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      toast({
        title: "Maximum employees reached",
        description: "You can only select 2 employees per work order.",
        variant: "destructive",
      });
    }
  };

  const handleCreateWorkOrder = () => {
    if (!selectedDate || !selectedTimeSlot || !selectedZone || !selectedCar || selectedEmployees.length !== 2) {
      toast({
        title: "Incomplete information",
        description: "Please fill in all fields and select exactly 2 employees.",
        variant: "destructive",
      });
      return;
    }

    const newWorkOrder: WorkOrder = {
      id: `wo-${Date.now()}`,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      zone: selectedZone,
      car: selectedCar,
      employees: selectedEmployees,
      status: 'planned',
    };

    setWorkOrders([...workOrders, newWorkOrder]);
    
    // Reset form
    setSelectedDate(undefined);
    setSelectedTimeSlot('');
    setSelectedZone('');
    setSelectedCar('');
    setSelectedEmployees([]);

    toast({
      title: "Work order created",
      description: "New delivery work order has been successfully planned.",
    });
  };

  const getEmployeeName = (id: string) => employees.find(emp => emp.id === id)?.name || '';
  const getCarName = (id: string) => cars.find(car => car.id === id)?.name || '';
  const getZoneName = (id: string) => zones.find(zone => zone.id === id)?.name || '';
  const getTimeSlotLabel = (id: string) => timeSlots.find(slot => slot.id === id)?.label || '';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Delivery Planning
          </h1>
          <p className="text-muted-foreground text-lg">
            Plan and schedule delivery work orders across Sweden
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Planning Form */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create Work Order
              </CardTitle>
              <CardDescription>
                Schedule a new delivery work order with date, time, zone, car, and team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Slot</label>
                <div className="grid grid-cols-1 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTimeSlot === slot.id ? "nordic" : "outline"}
                      className="justify-start"
                      onClick={() => setSelectedTimeSlot(slot.id)}
                    >
                      <Clock className="h-4 w-4" />
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Zone Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Zone</label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {zone.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Car Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle</label>
                <Select value={selectedCar} onValueChange={setSelectedCar}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{car.name}</div>
                            <div className="text-xs text-muted-foreground">{car.type}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Team Members ({selectedEmployees.length}/2)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {employees.map((employee) => (
                    <Button
                      key={employee.id}
                      variant={selectedEmployees.includes(employee.id) ? "nordic" : "outline"}
                      className="justify-start h-auto p-3"
                      onClick={() => handleEmployeeSelect(employee.id)}
                      disabled={!selectedEmployees.includes(employee.id) && selectedEmployees.length >= 2}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <div className="text-left flex-1">
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {employee.role} • {employee.experience}
                          </div>
                        </div>
                        {selectedEmployees.includes(employee.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Create Button */}
              <Button 
                onClick={handleCreateWorkOrder}
                className="w-full"
                variant="nordic"
                size="lg"
              >
                Create Work Order
              </Button>
            </CardContent>
          </Card>

          {/* Scheduled Work Orders */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Scheduled Work Orders</CardTitle>
              <CardDescription>
                Current planned deliveries ({workOrders.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {workOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No work orders scheduled yet
                  </div>
                ) : (
                  workOrders.map((order) => (
                    <Card key={order.id} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {format(order.date, "MMM dd, yyyy")}
                            </Badge>
                            <Badge variant="secondary">
                              {getTimeSlotLabel(order.timeSlot)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">{getZoneName(order.zone)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Car className="h-4 w-4 text-primary" />
                              <span>{getCarName(order.car)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-primary" />
                              <div className="flex flex-wrap gap-1">
                                {order.employees.map((empId) => (
                                  <Badge key={empId} variant="outline" className="text-xs">
                                    {getEmployeeName(empId)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}