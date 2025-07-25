import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPin, Clock, Package, X } from 'lucide-react';
import { DeliveryAssignment } from '@/types/delivery-planning';

interface AssignmentSummaryProps {
  assignment: DeliveryAssignment | null;
  onClose: () => void;
}

export function AssignmentSummary({ assignment, onClose }: AssignmentSummaryProps) {
  if (!assignment) return null;

  const zoneName = assignment.zone?.name || assignment.zoneGroup?.name || 'No Zone';
  const zoneColor = assignment.zone?.color || assignment.zoneGroup?.color || '#0078D4';
  const timeRange = assignment.startHour && assignment.endHour 
    ? `${assignment.startHour}:00 - ${assignment.endHour}:00`
    : `${assignment.timeSlot}:00 - ${parseInt(assignment.timeSlot) + 1}:00`;
  
  const orderCount = assignment.zone?.orders?.length || 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Assignment Details</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone Info */}
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: zoneColor }}
          />
          <span className="font-medium">{zoneName}</span>
        </div>

        {/* Date and Time */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(assignment.date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{timeRange}</span>
          </div>
        </div>


        {/* Delivery Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Deliveries</span>
          </div>
          <div className="text-sm">
            <div>Planned: {assignment.deliveryCount}</div>
            <div>Orders: {orderCount}</div>
          </div>
        </div>

        {/* Postcodes */}
        {assignment.postcodes && assignment.postcodes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Postcodes ({assignment.postcodes.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {assignment.postcodes.slice(0, 5).map((code) => (
                <Badge key={code} variant="outline" className="text-xs">
                  {code}
                </Badge>
              ))}
              {assignment.postcodes.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{assignment.postcodes.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge 
            variant={assignment.status === 'completed' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {assignment.status}
          </Badge>
        </div>

        {/* Notes */}
        {assignment.notes && (
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Notes:</span>
            <p className="text-sm bg-muted p-2 rounded">{assignment.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}