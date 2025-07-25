import React, { useState } from 'react';
import { MapPin, Users, Package, Settings, Search, Route } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ZoneManagement } from './ZoneManagement';
import { ZoneGroupsTab } from './ZoneGroupsTab';
import { ToolsTab } from './ToolsTab';
import { RouteVisualization } from './RouteVisualization';
import { RouteOptimizer } from './RouteOptimizer';
import { NotesAnnotations } from './NotesAnnotations';
import { AssignmentSummary } from './AssignmentSummary';
import { DeliveryAssignment } from '@/types/delivery-planning';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';

interface PlanningSidebarProps {
  selectedAssignment?: DeliveryAssignment | null;
  onAssignmentClose?: () => void;
}

export function PlanningSidebar({ selectedAssignment, onAssignmentClose }: PlanningSidebarProps) {
  const { removeAssignment } = useDeliveryPlanning();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const assignmentData = e.dataTransfer.getData('assignment');
    const zoneData = e.dataTransfer.getData('zone');
    const zoneGroupData = e.dataTransfer.getData('zoneGroup');
    
    // Only remove assignments if they are being dropped directly on a removal zone
    // Don't interfere with zone/group dragging to calendar
    if (assignmentData && !zoneData && !zoneGroupData) {
      const assignment = JSON.parse(assignmentData);
      // Only remove if dropped in the header removal area, not the whole sidebar
      const rect = e.currentTarget.getBoundingClientRect();
      const headerHeight = 120; // Approximate header height
      if (e.clientY - rect.top < headerHeight) {
        removeAssignment(assignment.id);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const assignmentData = e.dataTransfer.getData('assignment');
    // Only show drag over effect for assignments being removed
    if (assignmentData) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className={`w-72 sm:w-80 lg:w-96 border-r border-border bg-card shadow-soft flex flex-col transition-all duration-300 ${
      isDragOver ? 'bg-muted/50 border-primary/30' : ''
    }`}
         onDrop={handleDrop}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
    >
      {/* Sidebar Header - Removal zone */}
      <div className={`p-3 sm:p-4 border-b border-border space-y-3 transition-colors ${
        isDragOver ? 'bg-destructive/10 border-destructive/30' : ''
      }`}>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Delivery Control Panel
          </h2>
          <p className="text-xs text-muted-foreground">
            Drag zones to calendar to assign • Drop assignments here to remove
            {isDragOver && (
              <span className="block text-destructive font-medium mt-1 animate-pulse">
                🗑️ Drop assignment here to remove
              </span>
            )}
          </p>
        </div>
        
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search postcodes, zones, trucks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="zones" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
          <TabsTrigger value="zones" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Zones
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-xs">
            <Package className="h-3 w-3 mr-1" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="routes" className="text-xs">
            <Route className="h-3 w-3 mr-1" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Tools
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="zones" className="h-full p-0 m-0">
            <ZoneManagement searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="groups" className="h-full p-0 m-0">
            <ZoneGroupsTab searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="routes" className="h-full p-0 m-0">
            <div className="p-4 space-y-4 h-full overflow-y-auto">
              <RouteVisualization 
                zones={[]} 
                assignments={[]} 
                selectedDate={new Date()} 
              />
              <RouteOptimizer onOptimize={() => {}} />
            </div>
          </TabsContent>
          
          <TabsContent value="tools" className="h-full p-0 m-0">
            <ToolsTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* Assignment Details Section */}
      {selectedAssignment && (
        <div className="border-t">
          <AssignmentSummary
            assignment={selectedAssignment}
            onClose={onAssignmentClose || (() => {})}
          />
        </div>
      )}

      {/* Notes Section */}
      <div className="border-t">
        <NotesAnnotations />
      </div>
    </div>
  );
}