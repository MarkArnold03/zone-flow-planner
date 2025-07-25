import React, { useState } from 'react';
import { MapPin, Users, Package, Settings, Search, Route } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ZoneManagement } from './ZoneManagement';
import { ZoneGroupsTab } from './ZoneGroupsTab';
import { WorkersTab } from './WorkersTab';
import { ToolsTab } from './ToolsTab';
import { RouteVisualization } from './RouteVisualization';
import { RouteOptimizer } from './RouteOptimizer';
import { NotesAnnotations } from './NotesAnnotations';
import { AssignmentSummary } from './AssignmentSummary';
import { DeliveryAssignment } from '@/types/delivery-planning';

interface PlanningSidebarProps {
  selectedAssignment?: DeliveryAssignment | null;
  onAssignmentClose?: () => void;
}

export function PlanningSidebar({ selectedAssignment, onAssignmentClose }: PlanningSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-80 border-r bg-card shadow-lg flex flex-col animate-slide-in-right">
      {/* Assignment Details Section - Top Priority */}
      {selectedAssignment && (
        <div className="border-b">
          <AssignmentSummary
            assignment={selectedAssignment}
            onClose={onAssignmentClose || (() => {})}
          />
        </div>
      )}

      {/* Sidebar Header */}
      <div className="p-4 border-b space-y-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Delivery Control Panel
          </h2>
          <p className="text-xs text-muted-foreground">
            Drag & drop to assign zones, trucks, and routes
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
        <TabsList className="grid w-full grid-cols-5 mx-4 mt-4">
          <TabsTrigger value="zones" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Zones
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-xs">
            <Package className="h-3 w-3 mr-1" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="workers" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Workers
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
          
          <TabsContent value="workers" className="h-full p-0 m-0">
            <WorkersTab searchQuery={searchQuery} />
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

      {/* Notes Section */}
      <div className="border-t">
        <NotesAnnotations />
      </div>
    </div>
  );
}