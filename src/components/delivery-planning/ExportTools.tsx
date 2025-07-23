import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { addDays, format } from 'date-fns';

export function ExportTools() {
  const { state, filteredAssignments } = useDeliveryPlanning();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf' as 'pdf' | 'excel',
    dateRange: 'current' as 'current' | 'week' | 'month' | 'custom',
    includeRoutes: false,
    includeNotes: false,
    groupByTruck: true,
    includeConflicts: true,
  });

  const handleExport = () => {
    // Simulate export functionality
    const exportData = {
      assignments: filteredAssignments,
      trucks: state.trucks,
      zones: state.zones,
      options: exportOptions,
      exportDate: new Date(),
    };

    // In a real app, this would generate and download the file
    console.log('Exporting data:', exportData);
    
    toast({
      title: `Export started`,
      description: `Generating ${exportOptions.format.toUpperCase()} with ${filteredAssignments.length} assignments`,
    });

    setIsDialogOpen(false);
  };

  const getExportPreview = () => {
    const assignmentCount = filteredAssignments.length;
    const truckCount = new Set(filteredAssignments.map(a => a.truck?.id).filter(Boolean)).size;
    const zoneCount = new Set(filteredAssignments.map(a => a.zone?.id || a.zoneGroup?.id).filter(Boolean)).size;
    
    return {
      assignments: assignmentCount,
      trucks: truckCount,
      zones: zoneCount,
    };
  };

  const preview = getExportPreview();

  return (
    <>
      {/* Quick Export Buttons */}
      <div className="flex space-x-2 mb-3">
        <Button
          variant="outline" 
          size="sm"
          onClick={() => {
            setExportOptions(prev => ({ ...prev, format: 'pdf' }));
            handleExport();
          }}
        >
          <FileText className="h-3 w-3 mr-1" />
          PDF
        </Button>
        <Button
          variant="outline" 
          size="sm"
          onClick={() => {
            setExportOptions(prev => ({ ...prev, format: 'excel' }));
            handleExport();
          }}
        >
          <FileSpreadsheet className="h-3 w-3 mr-1" />
          Excel
        </Button>
      </div>

      {/* Advanced Export Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Download className="h-3 w-3 mr-2" />
            Advanced Export
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Planning Data</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <Label>Export Format</Label>
              <Select 
                value={exportOptions.format} 
                onValueChange={(value: 'pdf' | 'excel') => 
                  setExportOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>PDF Report</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Excel Spreadsheet</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label>Date Range</Label>
              <Select 
                value={exportOptions.dateRange} 
                onValueChange={(value: any) => 
                  setExportOptions(prev => ({ ...prev, dateRange: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current View</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Options */}
            <div className="space-y-2">
              <Label>Include in Export</Label>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-routes"
                    checked={exportOptions.includeRoutes}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeRoutes: checked as boolean }))
                    }
                  />
                  <label htmlFor="include-routes" className="text-sm">Route details</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-notes"
                    checked={exportOptions.includeNotes}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeNotes: checked as boolean }))
                    }
                  />
                  <label htmlFor="include-notes" className="text-sm">Notes & annotations</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-conflicts"
                    checked={exportOptions.includeConflicts}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeConflicts: checked as boolean }))
                    }
                  />
                  <label htmlFor="include-conflicts" className="text-sm">Conflict reports</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="group-by-truck"
                    checked={exportOptions.groupByTruck}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, groupByTruck: checked as boolean }))
                    }
                  />
                  <label htmlFor="group-by-truck" className="text-sm">Group by truck</label>
                </div>
              </div>
            </div>

            {/* Export Preview */}
            <div className="p-3 bg-muted/30 rounded space-y-2">
              <div className="text-sm font-medium">Export Preview:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{preview.assignments}</span>
                  <span className="text-muted-foreground">assignments</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Truck className="h-3 w-3" />
                  <span>{preview.trucks}</span>
                  <span className="text-muted-foreground">trucks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{preview.zones}</span>
                  <span className="text-muted-foreground">zones</span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export {exportOptions.format.toUpperCase()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}