import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { ConflictType } from '@/types/delivery-planning';

interface ConflictViewerProps {
  conflicts: ConflictType[];
  title?: string;
}

export function ConflictViewer({ conflicts, title = "Conflicts Detected" }: ConflictViewerProps) {
  if (conflicts.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          No conflicts detected. Assignment is valid.
        </AlertDescription>
      </Alert>
    );
  }

  const getConflictIcon = (severity: ConflictType['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getConflictBadgeVariant = (severity: ConflictType['severity']) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  const getConflictTypeLabel = (type: ConflictType['type']) => {
    switch (type) {
      case 'capacity_exceeded':
        return 'Capacity Exceeded';
      case 'double_booking':
        return 'Double Booking';
      case 'worker_conflict':
        return 'Worker Conflict';
      case 'zone_overlap':
        return 'Zone Overlap';
      case 'insufficient_time':
        return 'Insufficient Time';
      default:
        return 'Unknown Conflict';
    }
  };

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          {title} ({conflicts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {conflicts.map((conflict, index) => (
          <Alert key={index} className="border-l-4 border-l-orange-500">
            <div className="flex items-start gap-3">
              {getConflictIcon(conflict.severity)}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getConflictTypeLabel(conflict.type)}</span>
                  <Badge variant={getConflictBadgeVariant(conflict.severity)}>
                    {conflict.severity}
                  </Badge>
                </div>
                
                <AlertDescription className="text-sm">
                  <strong>Issue:</strong> {conflict.message}
                </AlertDescription>
                
                <AlertDescription className="text-sm">
                  <strong>Reason:</strong> {conflict.reason}
                </AlertDescription>
                
                {conflict.suggestion && (
                  <AlertDescription className="text-sm text-primary bg-muted/50 p-2 rounded">
                    <strong>Suggestion:</strong> {conflict.suggestion}
                  </AlertDescription>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}