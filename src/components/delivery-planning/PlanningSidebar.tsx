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
    <div className={`w-72 sm:w-80 lg:w-96 border-r border-border bg-card shadow-soft flex flex-col transition-all duration-200 relative z-10 h-full overflow-hidden ${
      isDragOver ? 'bg-muted border-destructive/30' : ''
    }`}
         onDrop={handleDrop}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
    >
      {/* Sidebar Header */}
      <div className={`p-3 sm:p-4 border-b border-border space-y-3 transition-all duration-200 ${
        isDragOver ? 'bg-destructive/10 border-destructive/30' : 'bg-card'
      }`}>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Leverans Kontrollpanel
          </h2>
          <p className="text-xs text-muted-foreground">
            Dra zoner till kalender för att tilldela • Släpp uppdrag här för att ta bort
            {isDragOver && (
              <span className="block text-destructive font-medium mt-1">
                🗑️ Släpp uppdrag här för att ta bort
              </span>
            )}
          </p>
        </div>
        
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök postnummer, zoner, fordon..."
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
            Zoner
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-xs">
            <Package className="h-3 w-3 mr-1" />
            Grupper
          </TabsTrigger>
          <TabsTrigger value="routes" className="text-xs">
            <Route className="h-3 w-3 mr-1" />
            Rutter
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Verktyg
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="zones" className="h-full p-0 m-0">
            <ZoneManagement searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="groups" className="h-full p-0 m-0">
            <ZoneGroupsTab searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="routes" className="h-full p-0 m-0">
            <div className="p-4 space-y-4">
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