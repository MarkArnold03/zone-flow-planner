import React, { useState } from 'react';
import { Zap, MapPin, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RouteOptimizerProps {
  onOptimize: () => void;
  isOptimizing?: boolean;
}

export function RouteOptimizer({ onOptimize, isOptimizing = false }: RouteOptimizerProps) {
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  const handleOptimize = () => {
    onOptimize();
    
    // Simulate optimization process
    setTimeout(() => {
      setOptimizationResults({
        originalDistance: 450,
        optimizedDistance: 320,
        timeSaved: 85,
        fuelSaved: 12.5,
        efficiency: 78
      });
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Route Optimizer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="w-full"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                Optimizing Routes...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Optimize Today's Routes
              </>
            )}
          </Button>

          {isOptimizing && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Analyzing delivery patterns...
              </div>
              <Progress value={65} className="animate-pulse" />
            </div>
          )}

          {optimizationResults && (
            <div className="space-y-3 pt-4 border-t animate-fade-in">
              <h4 className="font-medium text-sm text-primary">Optimization Results</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Distance</span>
                  </div>
                  <div className="text-sm">
                    <span className="line-through text-muted-foreground">
                      {optimizationResults.originalDistance}km
                    </span>
                    {' → '}
                    <span className="font-medium text-primary">
                      {optimizationResults.optimizedDistance}km
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Time Saved</span>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {optimizationResults.timeSaved} mins
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Truck className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Fuel Saved</span>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {optimizationResults.fuelSaved}L
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Efficiency</span>
                  </div>
                  <div className="text-sm">
                    <Badge variant="secondary" className="text-xs">
                      {optimizationResults.efficiency}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}