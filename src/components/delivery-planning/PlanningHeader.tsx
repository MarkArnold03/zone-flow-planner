import React from 'react';
import { format, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { ExportTools } from './ExportTools';
import { SettingsDialog } from './SettingsDialog';

export function PlanningHeader() {
  const { state, updateDate } = useDeliveryPlanning();
  const navigate = useNavigate();

  const goToPrevious = () => {
    const newDate = state.viewMode === 'week' 
      ? subWeeks(state.currentDate, 1)
      : subMonths(state.currentDate, 1);
    updateDate(newDate);
  };

  const goToNext = () => {
    const newDate = state.viewMode === 'week'
      ? addWeeks(state.currentDate, 1)
      : addMonths(state.currentDate, 1);
    updateDate(newDate);
  };

  const goToToday = () => {
    updateDate(new Date());
  };

  const getHeaderText = () => {
    if (state.viewMode === 'week') {
      return `Week ${format(state.currentDate, 'w, yyyy')}`;
    }
    return format(state.currentDate, 'MMMM yyyy');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-4 rounded-lg shadow-float border-border/30 animate-slide-up relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <h1 className="text-responsive-lg font-bold bg-gradient-primary bg-clip-text text-transparent animate-scale-in">
          Delivery Planning
        </h1>
        <div className="flex items-center gap-1 sm:gap-2 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          <Button variant="glass" size="sm" onClick={goToPrevious} className="hover-lift">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="glass" size="sm" onClick={goToNext} className="hover-lift">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="premium" size="sm" onClick={goToToday} className="bg-today-highlight border-today-border text-today-time hover:bg-today-time-bg shadow-glow">
            Today
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-responsive-base font-semibold text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {getHeaderText()}
        </h2>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button variant="glass" size="sm" onClick={() => navigate('/route-map')} className="flex-shrink-0 hover-lift">
            <MapPin className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Route Map</span>
          </Button>
          <ExportTools />
          <SettingsDialog>
            <Button variant="glass" size="sm" className="flex-shrink-0 hover-lift">
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </SettingsDialog>
        </div>
      </div>
    </div>
  );
}