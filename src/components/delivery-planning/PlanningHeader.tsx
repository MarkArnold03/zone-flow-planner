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
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-foreground">
          Delivery Planning
        </h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          {getHeaderText()}
        </h2>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/route-map')}>
            <MapPin className="h-4 w-4 mr-2" />
            Route Map
          </Button>
          <ExportTools />
          <SettingsDialog>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </SettingsDialog>
        </div>
      </div>
    </div>
  );
}