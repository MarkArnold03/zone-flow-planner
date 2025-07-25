import React, { useState } from 'react';
import { PlanningCalendar } from './PlanningCalendar';
import { PlanningSidebar } from './PlanningSidebar';
import { DeliveryAssignment } from '@/types/delivery-planning';

export function DeliveryPlanningApp() {
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null);

  return (
    <div className="min-h-screen bg-gradient-header flex flex-col lg:flex-row animate-fade-in relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-2xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      
      <PlanningSidebar 
        selectedAssignment={selectedAssignment}
        onAssignmentClose={() => setSelectedAssignment(null)}
      />
      <PlanningCalendar 
        selectedAssignment={selectedAssignment}
        onAssignmentSelect={setSelectedAssignment}
      />
    </div>
  );
}