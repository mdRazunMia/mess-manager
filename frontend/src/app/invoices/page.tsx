'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

function useInvoices(month: number, year: number) {
  return useQuery({
    queryKey: ['invoices', month, year],
    queryFn: () => api.get(`/invoices?month=${month}&year=${year}`),
  });
}

export default function InvoicesPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useInvoices(month, year);

  const generateMutation = useMutation({
    mutationFn: () => api.post(`/invoices/generate?month=${month}&year=${year}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', month, year] });
      toast.success('Invoices generated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate invoices');
    },
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const downloadInvoice = (id: number) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/${id}/download`, '_blank');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Generate and download monthly invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {months.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm w-24"
          />
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Invoices'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Email Sent</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.member?.name}</TableCell>
                  <TableCell>{months[invoice.month - 1]}</TableCell>
                  <TableCell>{invoice.year}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${invoice.email_sent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {invoice.email_sent ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {invoice.sent_at ? new Date(invoice.sent_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadInvoice(invoice.id)}
                    >
                      Download PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
