import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Navigation, Clock, Truck, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function RouteMap() {
  const navigate = useNavigate();
  const { state } = useDeliveryPlanning();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Get selected time range from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const selectedTimeRangeDate = urlParams.get('date');
  const startHour = urlParams.get('startHour');
  const endHour = urlParams.get('endHour');
  
  // Use URL params if available, otherwise use the filters
  React.useEffect(() => {
    if (selectedTimeRangeDate) {
      setSelectedDate(selectedTimeRangeDate);
    }
  }, [selectedTimeRangeDate]);
  
  // Filter assignments based on selections and selected time range
  const filteredAssignments = state.assignments.filter(assignment => {
    const matchesDate = format(assignment.date, 'yyyy-MM-dd') === selectedDate;
    const matchesWorker = !selectedWorker;
    const matchesTimeSlot = !selectedTimeSlot || assignment.timeSlot === selectedTimeSlot;
    
    // If we have a selected time range from URL, filter by that
    if (startHour && endHour) {
      const assignmentHour = assignment.startHour || parseInt(assignment.timeSlot.split(':')[0]);
      const matchesTimeRange = assignmentHour >= parseInt(startHour) && assignmentHour < parseInt(endHour);
      return matchesDate && matchesWorker && matchesTimeRange;
    }
    
    return matchesDate && matchesWorker && matchesTimeSlot;
  });

  // Get unique dates, trucks, and time slots for filters
  const availableDates = [...new Set(state.assignments.map(a => format(a.date, 'yyyy-MM-dd')))];
  const availableWorkers: any[] = [];
  const availableTimeSlots = [...new Set(state.assignments.map(a => a.timeSlot))];

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-0.1276, 51.5074], // London coordinates
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for each assignment
    filteredAssignments.forEach((assignment, index) => {
      if (assignment.zone) {
        // Create a marker for each postcode in the zone
        assignment.zone.postcodes.forEach((postcode, pcIndex) => {
          // Mock coordinates - in real implementation, you'd geocode postcodes
          const lng = -0.1276 + (Math.random() - 0.5) * 0.2;
          const lat = 51.5074 + (Math.random() - 0.5) * 0.2;

          const markerElement = document.createElement('div');
          markerElement.className = 'route-marker';
          markerElement.style.cssText = `
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: ${assignment.zone.color};
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          `;
          markerElement.textContent = (pcIndex + 1).toString();

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0; color: ${assignment.zone.color};">${assignment.zone.name}</h4>
              <p style="margin: 0 0 4px 0;"><strong>Postcode:</strong> ${postcode}</p>
              <p style="margin: 0 0 4px 0;"><strong>Time:</strong> ${assignment.timeSlot}</p>
              <p style="margin: 0 0 4px 0;"><strong>Zone:</strong> ${assignment.zone?.name || 'Unassigned'}</p>
              <p style="margin: 0;"><strong>Stop:</strong> ${pcIndex + 1} of ${assignment.zone.postcodes.length}</p>
            </div>
          `);

          new mapboxgl.Marker(markerElement)
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.current!);
        });
      }
    });

    // Add route lines if there are multiple stops
    filteredAssignments.forEach(assignment => {
      if (assignment.zone && assignment.zone.postcodes.length > 1) {
        // Create route line between postcodes
        const coordinates = assignment.zone.postcodes.map(() => [
          -0.1276 + (Math.random() - 0.5) * 0.2,
          51.5074 + (Math.random() - 0.5) * 0.2
        ]);

        if (map.current?.getSource(`route-${assignment.id}`)) {
          map.current.removeLayer(`route-${assignment.id}`);
          map.current.removeSource(`route-${assignment.id}`);
        }

        map.current?.addSource(`route-${assignment.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates
            }
          }
        });

        map.current?.addLayer({
          id: `route-${assignment.id}`,
          type: 'line',
          source: `route-${assignment.id}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': assignment.zone.color,
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
      }
    });
  }, [filteredAssignments, mapboxToken]);

  const calculateRouteStats = () => {
    const totalDeliveries = filteredAssignments.reduce((sum, a) => sum + a.deliveryCount, 0);
    const totalStops = filteredAssignments.reduce((sum, a) => sum + (a.zone?.postcodes.length || 0), 0);
    const averageStopsPerRoute = totalStops / Math.max(filteredAssignments.length, 1);
    
    return { totalDeliveries, totalStops, averageStopsPerRoute };
  };

  const { totalDeliveries, totalStops, averageStopsPerRoute } = calculateRouteStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Planning
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Route Visualization
              {startHour && endHour && (
                <Badge variant="secondary" className="ml-2">
                  {startHour}:00 - {endHour}:00
                </Badge>
              )}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Mapbox Token Input */}
            {!mapboxToken && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Mapbox Token Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Enter your Mapbox public token to display the map. Get one at{' '}
                    <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      mapbox.com
                    </a>
                  </p>
                  <Input
                    placeholder="pk.eyJ1..."
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map(date => (
                        <SelectItem key={date} value={date}>
                          {format(new Date(date), 'EEE, MMM dd')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Worker</label>
                  <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                    <SelectTrigger>
                      <SelectValue placeholder="All workers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All workers</SelectItem>
                      {availableWorkers.map(worker => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Time Slot</label>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="All time slots" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All time slots</SelectItem>
                      {availableTimeSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Route Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Route Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{totalDeliveries}</div>
                    <div className="text-xs text-muted-foreground">Deliveries</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">{totalStops}</div>
                    <div className="text-xs text-muted-foreground">Stops</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">{averageStopsPerRoute.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Avg/Route</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Active Routes ({filteredAssignments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredAssignments.map((assignment, index) => (
                  <div key={assignment.id} className="p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{assignment.zone?.name || assignment.zoneGroup?.name || 'Unassigned'}</span>
                      <Badge variant="outline" className="text-xs">
                        {assignment.timeSlot}
                      </Badge>
                    </div>
                    
                    {assignment.zone && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: assignment.zone.color }}
                          />
                          <span className="text-sm font-medium">{assignment.zone.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-5">
                          {assignment.zone.postcodes.length} stops: {assignment.zone.postcodes.join(' → ')}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground ml-5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Est. {assignment.zone.postcodes.length * 30} min
                          </span>
                          <span>{assignment.deliveryCount} deliveries</span>
                        </div>
                      </div>
                    )}

                    {assignment.conflicts && assignment.conflicts.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        {assignment.conflicts.length} conflict(s)
                      </div>
                    )}
                  </div>
                ))}

                {filteredAssignments.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No routes found for selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {!mapboxToken && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <div className="text-center space-y-2">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Enter Mapbox token to view routes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}