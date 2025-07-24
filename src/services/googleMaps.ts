// Google Maps integration service
interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteRequest {
  origin: Coordinates;
  destination: Coordinates;
  waypoints?: Coordinates[];
  optimizeWaypoints?: boolean;
}

interface RouteResponse {
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string;
  steps: RouteStep[];
  optimizedOrder?: number[];
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: Coordinates;
  endLocation: Coordinates;
}

class GoogleMapsService {
  private apiKey: string;
  private directionsService: any = null;
  private geocoder: any = null;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
    this.initializeServices();
  }

  private async initializeServices() {
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      this.directionsService = new (window as any).google.maps.DirectionsService();
      this.geocoder = new (window as any).google.maps.Geocoder();
    } else {
      console.warn('Google Maps API not loaded');
    }
  }

  async loadGoogleMapsAPI(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=geometry,places`;
      script.async = true;
      script.onload = () => {
        this.initializeServices();
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      document.head.appendChild(script);
    });
  }

  async geocodeAddress(address: string): Promise<Coordinates> {
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  async calculateRoute(request: RouteRequest): Promise<RouteResponse> {
    if (!this.directionsService) {
      throw new Error('Directions service not initialized');
    }

    const waypoints = request.waypoints?.map(point => ({
      location: new (window as any).google.maps.LatLng(point.lat, point.lng),
      stopover: true
    })) || [];

    const directionsRequest = {
      origin: new (window as any).google.maps.LatLng(request.origin.lat, request.origin.lng),
      destination: new (window as any).google.maps.LatLng(request.destination.lat, request.destination.lng),
      waypoints,
      optimizeWaypoints: request.optimizeWaypoints || false,
      travelMode: (window as any).google.maps.TravelMode.DRIVING,
      unitSystem: (window as any).google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    return new Promise((resolve, reject) => {
      this.directionsService!.route(directionsRequest, (result, status) => {
        if (status === 'OK' && result) {
          const route = result.routes[0];
          const leg = route.legs[0];

          const steps: RouteStep[] = [];
          route.legs.forEach(leg => {
            leg.steps.forEach(step => {
              steps.push({
                instruction: step.instructions,
                distance: step.distance?.value || 0,
                duration: step.duration?.value || 0,
                startLocation: {
                  lat: step.start_location.lat(),
                  lng: step.start_location.lng()
                },
                endLocation: {
                  lat: step.end_location.lat(),
                  lng: step.end_location.lng()
                }
              });
            });
          });

          resolve({
            distance: route.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0),
            duration: route.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0),
            polyline: route.overview_polyline,
            steps,
            optimizedOrder: result.routes[0].waypoint_order
          });
        } else {
          reject(new Error(`Route calculation failed: ${status}`));
        }
      });
    });
  }

  async optimizeMultipleStops(
    origin: Coordinates,
    destination: Coordinates,
    stops: Coordinates[]
  ): Promise<RouteResponse> {
    return this.calculateRoute({
      origin,
      destination,
      waypoints: stops,
      optimizeWaypoints: true
    });
  }

  async getDistanceMatrix(
    origins: Coordinates[],
    destinations: Coordinates[]
  ): Promise<number[][]> {
    if (!(window as any).google || !(window as any).google.maps) {
      throw new Error('Google Maps not loaded');
    }

    const service = new (window as any).google.maps.DistanceMatrixService();

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix({
        origins: origins.map(origin => new (window as any).google.maps.LatLng(origin.lat, origin.lng)),
        destinations: destinations.map(dest => new (window as any).google.maps.LatLng(dest.lat, dest.lng)),
        travelMode: (window as any).google.maps.TravelMode.DRIVING,
        unitSystem: (window as any).google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response: any, status: string) => {
        if (status === 'OK' && response) {
          const matrix: number[][] = [];
          response.rows.forEach(row => {
            const distances: number[] = [];
            row.elements.forEach(element => {
              if (element.status === 'OK') {
                distances.push(element.distance?.value || 0);
              } else {
                distances.push(Infinity);
              }
            });
            matrix.push(distances);
          });
          resolve(matrix);
        } else {
          reject(new Error(`Distance matrix calculation failed: ${status}`));
        }
      });
    });
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

// Create a singleton instance
export const googleMapsService = new GoogleMapsService();

// Export types for use in other files
export type {
  Coordinates,
  RouteRequest,
  RouteResponse,
  RouteStep
};