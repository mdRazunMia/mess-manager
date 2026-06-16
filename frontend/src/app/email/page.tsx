'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/members?status=active'),
  });
}

export default function EmailPage() {
  const { data: members } = useMembers();
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [template, setTemplate] = useState('custom');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendAll, setSendAll] = useState(false);

  const sendMutation = useMutation({
    mutationFn: (data: any) => api.post('/email/send-bulk', data),
    onSuccess: (data: any) => {
      toast.success(`Emails sent: ${data.results?.filter((r: any) => r.success).length || 0}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send emails');
    },
  });

  const handleSend = () => {
    const memberIds = sendAll ? members?.map((m: any) => m.id) : selectedMembers;
    sendMutation.mutate({
      member_ids: memberIds,
      subject,
      body,
      template,
    });
  };

  const templates: Record<string, string> = {
    custom: '',
    monthly_bill: 'Dear [Member Name],\n\nYour monthly mess bill has been generated. Please check the invoice for details.\n\nThank you,\nMess Management',
    payment_reminder: 'Dear [Member Name],\n\nThis is a friendly reminder to settle your mess dues. Please make the payment at your earliest convenience.\n\nThank you,\nMess Management',
  };

  const handleTemplateChange = (value: string | null) => {
    if (!value) return;
    setTemplate(value);
    setBody(templates[value] || '');
  };

  const toggleMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email System</h1>
        <p className="text-muted-foreground">Send emails to members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Message</SelectItem>
                  <SelectItem value="monthly_bill">Monthly Bill</SelectItem>
                  <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Enter your message..."
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending || (!sendAll && selectedMembers.length === 0)}
            >
              {sendMutation.isPending ? 'Sending...' : 'Send Email'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendAll"
                checked={sendAll}
                onCheckedChange={(checked) => setSendAll(checked as boolean)}
              />
              <Label htmlFor="sendAll">Send to all members</Label>
            </div>

            {!sendAll && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {members?.map((member: any) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                    />
                    <Label htmlFor={`member-${member.id}`} className="text-sm">
                      {member.name} ({member.email})
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
