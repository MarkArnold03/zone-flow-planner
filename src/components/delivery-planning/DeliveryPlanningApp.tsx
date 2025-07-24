import React from 'react';
import { PlanningCalendar } from './PlanningCalendar';
import { PlanningSidebar } from './PlanningSidebar';

export function DeliveryPlanningApp() {
  return (
    <div className="min-h-screen bg-background flex animate-fade-in">
      <PlanningSidebar />
      <PlanningCalendar />
    </div>
  );
}