import React from 'react';
import { Filter, Download, RotateCcw, Zap, Map, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { ExportTools } from './ExportTools';

export function ToolsTab() {
  const { state, updateFilters, filteredAssignments } = useDeliveryPlanning();

  const handleFilterChange = (type: string, value: string) => {
    updateFilters({ [type]: value === 'all' ? undefined : value });
  };

  const clearFilters = () => {
    updateFilters({ zone: undefined, worker: undefined, postcode: undefined });
  };

  const getConflictCount = () => {
    return filteredAssignments.filter(a => a.conflicts && a.conflicts.length > 0).length;
  };

  const hasActiveFilters = () => {
    return Object.values(state.filters).some(filter => filter !== undefined);
  };

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4" />
        <h3 className="text-sm font-semibold">Filters & Tools</h3>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Active Filters</CardTitle>
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Truck Filter */}
          <div>
            <label className="text-xs text-muted-foreground">Truck</label>
            <Select onValueChange={(value) => handleFilterChange('truck', value)}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All trucks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All trucks</SelectItem>
                {state.trucks.map((truck) => (
                  <SelectItem key={truck.id} value={truck.id}>
                    {truck.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zone Filter */}
          <div>
            <label className="text-xs text-muted-foreground">Zone</label>
            <Select onValueChange={(value) => handleFilterChange('zone', value)}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All zones</SelectItem>
                {state.zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Worker Filter */}
          <div>
            <label className="text-xs text-muted-foreground">Worker</label>
            <Select onValueChange={(value) => handleFilterChange('worker', value)}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All workers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workers</SelectItem>
                {state.trucks.flatMap(truck => truck.workers).map((worker) => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Current View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Total Assignments:</span>
            <Badge variant="secondary">{filteredAssignments.length}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Conflicts:</span>
            <Badge variant={getConflictCount() > 0 ? "destructive" : "secondary"}>
              {getConflictCount()}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Available Trucks:</span>
            <Badge variant="secondary">
              {state.trucks.filter(t => t.status === 'available').length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Smart Tools */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Smart Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Zap className="h-3 w-3 mr-2" />
            Auto-assign deliveries
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Map className="h-3 w-3 mr-2" />
            Optimize routes
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <AlertTriangle className="h-3 w-3 mr-2" />
            Resolve conflicts
          </Button>
        </CardContent>
      </Card>

      {/* Export Tools */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExportTools />
        </CardContent>
      </Card>

      {/* Help */}
      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded space-y-1">
        <div><strong>💡 Tips:</strong></div>
        <div>• Use filters to focus on specific trucks or zones</div>
        <div>• Smart tools help optimize assignments automatically</div>
        <div>• Export your plans for offline use</div>
      </div>
    </div>
  );
}