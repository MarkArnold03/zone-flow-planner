import React, { useState } from 'react';
import { Settings, Clock, MapPin, Bell, Palette, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  children: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    autoOptimize: false,
    defaultTimeSlots: '2',
    mapProvider: 'google',
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    zoneCapacityWarning: true,
    conflictAlerts: true,
    autoSave: true,
    language: 'en'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('deliveryPlanningSettings', JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure your delivery planning preferences and system settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Appearance</Label>
                <p className="text-sm text-muted-foreground">Customize the look and feel</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="language">Language</Label>
                  <p className="text-sm text-muted-foreground">Select interface language</p>
                </div>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sv">Svenska</SelectItem>
                    <SelectItem value="no">Norsk</SelectItem>
                    <SelectItem value="da">Dansk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="planning" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Planning Preferences</Label>
                <p className="text-sm text-muted-foreground">Configure planning behavior</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Working Hours Start</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => handleNestedSettingChange('workingHours', 'start', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">Working Hours End</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => handleNestedSettingChange('workingHours', 'end', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="default-slots">Default Time Slots</Label>
                  <p className="text-sm text-muted-foreground">Number of time slots per day</p>
                </div>
                <Select value={settings.defaultTimeSlots} onValueChange={(value) => handleSettingChange('defaultTimeSlots', value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-optimize">Auto Route Optimization</Label>
                  <p className="text-sm text-muted-foreground">Automatically optimize routes when assignments change</p>
                </div>
                <Switch
                  id="auto-optimize"
                  checked={settings.autoOptimize}
                  onCheckedChange={(checked) => handleSettingChange('autoOptimize', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="capacity-warning">Zone Capacity Warnings</Label>
                  <p className="text-sm text-muted-foreground">Show warnings when zone capacity is exceeded</p>
                </div>
                <Switch
                  id="capacity-warning"
                  checked={settings.zoneCapacityWarning}
                  onCheckedChange={(checked) => handleSettingChange('zoneCapacityWarning', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Notification Settings</Label>
                <p className="text-sm text-muted-foreground">Control when and how you're notified</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for important events</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="conflict-alerts">Conflict Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get alerted when planning conflicts occur</p>
                </div>
                <Switch
                  id="conflict-alerts"
                  checked={settings.conflictAlerts}
                  onCheckedChange={(checked) => handleSettingChange('conflictAlerts', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Integration Settings</Label>
                <p className="text-sm text-muted-foreground">Configure external services</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="map-provider">Map Provider</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred mapping service</p>
                </div>
                <Select value={settings.mapProvider} onValueChange={(value) => handleSettingChange('mapProvider', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Maps</SelectItem>
                    <SelectItem value="mapbox">Mapbox</SelectItem>
                    <SelectItem value="osm">OpenStreetMap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => {}}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}