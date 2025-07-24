import React from 'react';
import { MapPin, Route, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zone, ZoneGroup } from '@/types/delivery-planning';

interface RouteVisualizationProps {
  zones: Zone[];
  assignments: any[];
  selectedDate: Date;
}

export function RouteVisualization({ zones, assignments, selectedDate }: RouteVisualizationProps) {
  const todayAssignments = assignments.filter(
    assignment => assignment.date.toDateString() === selectedDate.toDateString()
  );

  const getRouteColor = (index: number) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center space-x-2">
        <Route className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Route Visualization</h3>
        <Badge variant="outline">
          {selectedDate.toLocaleDateString()}
        </Badge>
      </div>

      {todayAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No routes planned for this date</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {todayAssignments.map((assignment, index) => {
            const zone = zones.find(z => z.id === assignment.zoneId);
            if (!zone) return null;

            return (
              <Card 
                key={assignment.id}
                className="hover:shadow-md transition-all duration-200 hover-scale border-l-4"
                style={{ borderLeftColor: getRouteColor(index) }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getRouteColor(index) }}
                      />
                      <span>Route {index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{assignment.timeSlot}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">{zone.name}</h4>
                      <div className="flex flex-wrap gap-1">
                        {zone.postcodes.map((postcode) => (
                          <Badge key={postcode} variant="secondary" className="text-xs">
                            {postcode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Capacity: {zone.capacity} deliveries</span>
                      <span className="px-2 py-1 bg-muted/50 rounded">
                        Priority: {assignment.priority || 'Normal'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}