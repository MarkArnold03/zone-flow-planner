import React, { useState } from 'react';
import { PlanningCalendar } from './PlanningCalendar';
import { PlanningSidebar } from './PlanningSidebar';
import { DeliveryAssignment } from '@/types/delivery-planning';

export function DeliveryPlanningApp() {
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null);

  return (
    <div className="h-screen bg-background flex flex-col lg:flex-row animate-fade-in relative overflow-hidden">
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