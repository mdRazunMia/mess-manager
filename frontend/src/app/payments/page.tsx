'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';

function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments'),
  });
}

function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/members?status=active'),
  });
}

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    member_id: '',
    amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    method: 'cash',
    reference: '',
  });

  const { data: payments, isLoading } = usePayments();
  const { data: members } = useMembers();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment recorded');
      setOpen(false);
      setForm({
        member_id: '',
        amount: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        method: 'cash',
        reference: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      amount: parseFloat(form.amount),
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Track member payments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>Record Payment</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Member</Label>
                <Select
                  value={form.member_id}
                  onValueChange={(v) => setForm({ ...form, member_id: v || '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member: any) => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.payment_date}
                  onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select
                  value={form.method}
                  onValueChange={(v) => setForm({ ...form, method: v || 'cash' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference / Transaction ID</Label>
                <Input
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="bKash/Nagad TrxID"
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.member?.name}</TableCell>
                  <TableCell>৳{payment.amount}</TableCell>
                  <TableCell>{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="capitalize">{payment.method}</TableCell>
                  <TableCell>{payment.reference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
