'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings'),
  });
}

function useMess() {
  return useQuery({
    queryKey: ['mess'],
    queryFn: () => api.get('/mess'),
  });
}

export default function SettingsPage() {
  const { data: settings } = useSettings();
  const { data: mess } = useMess();
  const queryClient = useQueryClient();

  const updateSettings = useMutation({
    mutationFn: (data: any) => api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });

  const updateMess = useMutation({
    mutationFn: (data: any) => api.put('/mess/1', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess'] });
      toast.success('Mess info updated');
    },
  });

  const testSmtp = useMutation({
    mutationFn: () => api.post('/email/test-smtp', {}),
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success('SMTP connection verified');
      } else {
        toast.error(data.message || 'SMTP connection failed');
      }
    },
  });

  const currentMess = mess?.[0] || {};
  const currentSettings = settings || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your mess and system preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="meals">Meal Settings</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mess Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mess Name</Label>
                  <Input
                    defaultValue={currentMess.name}
                    onBlur={(e) => updateMess.mutate({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    defaultValue={currentMess.address}
                    onBlur={(e) => updateMess.mutate({ address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Manager Name</Label>
                  <Input
                    defaultValue={currentMess.manager_name}
                    onBlur={(e) => updateMess.mutate({ manager_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Manager Email</Label>
                  <Input
                    defaultValue={currentMess.manager_email}
                    onBlur={(e) => updateMess.mutate({ manager_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    defaultValue={currentMess.phone}
                    onBlur={(e) => updateMess.mutate({ phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input defaultValue={currentSettings.currency || 'BDT'} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal Weight Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Breakfast Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={currentSettings.breakfast_weight || 0.5}
                    onBlur={(e) => updateSettings.mutate({ breakfast_weight: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lunch Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={currentSettings.lunch_weight || 1.0}
                    onBlur={(e) => updateSettings.mutate({ lunch_weight: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dinner Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={currentSettings.dinner_weight || 1.0}
                    onBlur={(e) => updateSettings.mutate({ dinner_weight: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    defaultValue={currentSettings.smtp_host}
                    onBlur={(e) => updateSettings.mutate({ smtp_host: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    defaultValue={currentSettings.smtp_port || 587}
                    onBlur={(e) => updateSettings.mutate({ smtp_port: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Username</Label>
                  <Input
                    defaultValue={currentSettings.smtp_username}
                    onBlur={(e) => updateSettings.mutate({ smtp_username: e.target.value })}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    defaultValue={currentSettings.smtp_password}
                    onBlur={(e) => updateSettings.mutate({ smtp_password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sender Email</Label>
                  <Input
                    defaultValue={currentSettings.smtp_from}
                    onBlur={(e) => updateSettings.mutate({ smtp_from: e.target.value })}
                    placeholder="your-email@gmail.com"
                  />
                </div>
              </div>
              <Button onClick={() => testSmtp.mutate()} disabled={testSmtp.isPending}>
                {testSmtp.isPending ? 'Testing...' : 'Test SMTP Connection'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Settlement</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate monthly settlements automatically on the last day of each month
                  </p>
                </div>
                <Switch
                  checked={currentSettings.auto_close_enabled || false}
                  onCheckedChange={(checked) => updateSettings.mutate({ auto_close_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Send invoices via email automatically after settlement generation
                  </p>
                </div>
                <Switch
                  checked={currentSettings.auto_email_enabled || false}
                  onCheckedChange={(checked) => updateSettings.mutate({ auto_email_enabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
