import React from 'react';
import { format, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { ExportTools } from './ExportTools';
import { SettingsDialog } from './SettingsDialog';

interface PlanningHeaderProps {
  selectedTimeRange?: { date: Date; startHour: number; endHour: number } | null;
}

export function PlanningHeader({ selectedTimeRange }: PlanningHeaderProps) {
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-border bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <h1 className="text-responsive-lg font-bold text-foreground">
          Future Mobility Delivery Planning
        </h1>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="default" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <h2 className="text-responsive-base font-semibold text-muted-foreground">
          {getHeaderText()}
        </h2>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const params = new URLSearchParams();
              if (selectedTimeRange) {
                params.set('date', format(selectedTimeRange.date, 'yyyy-MM-dd'));
                params.set('startHour', selectedTimeRange.startHour.toString());
                params.set('endHour', selectedTimeRange.endHour.toString());
              }
              navigate(`/route-map?${params.toString()}`);
            }} 
            className="flex-shrink-0"
          >
            <MapPin className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Route Map</span>
          </Button>
          <ExportTools />
          <SettingsDialog>
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </SettingsDialog>
        </div>
      </div>
    </div>
  );
}