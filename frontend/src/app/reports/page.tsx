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

function useSettlements(month: number, year: number) {
  return useQuery({
    queryKey: ['settlements', month, year],
    queryFn: () => api.get(`/settlements?month=${month}&year=${year}`),
  });
}

function useMealReport(month: number, year: number) {
  return useQuery({
    queryKey: ['meal-report', month, year],
    queryFn: () => api.get(`/meals/report?month=${month}&year=${year}`),
  });
}

export default function ReportsPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const queryClient = useQueryClient();

  const { data: settlements, isLoading } = useSettlements(month, year);
  const { data: mealReport } = useMealReport(month, year);

  const generateMutation = useMutation({
    mutationFn: () => api.post(`/settlements/generate?month=${month}&year=${year}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', month, year] });
      toast.success('Monthly settlement generated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate settlement');
    },
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monthly Reports</h1>
          <p className="text-muted-foreground">View and generate monthly settlements</p>
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
            {generateMutation.isPending ? 'Generating...' : 'Generate Settlement'}
          </Button>
        </div>
      </div>

      {mealReport && (
        <Card>
          <CardHeader>
            <CardTitle>Meal Summary - {months[month - 1]} {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Breakfast</div>
                <div className="text-xl font-bold">{mealReport.total_breakfast}</div>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Lunch</div>
                <div className="text-xl font-bold">{mealReport.total_lunch}</div>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Dinner</div>
                <div className="text-xl font-bold">{mealReport.total_dinner}</div>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Weighted Meals</div>
                <div className="text-xl font-bold">{mealReport.total_weighted_meals?.toFixed(1)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Member Settlements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Meals</TableHead>
                <TableHead>Meal Rate</TableHead>
                <TableHead>Meal Cost</TableHead>
                <TableHead>Utility</TableHead>
                <TableHead>Payments</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Total Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements?.settlements?.map((settlement: any) => (
                <TableRow key={settlement.id}>
                  <TableCell className="font-medium">{settlement.member?.name}</TableCell>
                  <TableCell>{settlement.meal_count?.toFixed(1)}</TableCell>
                  <TableCell>৳{settlement.meal_rate?.toFixed(2)}</TableCell>
                  <TableCell>৳{settlement.meal_cost?.toFixed(2)}</TableCell>
                  <TableCell>৳{settlement.utility_share?.toFixed(2)}</TableCell>
                  <TableCell>৳{settlement.payment_total?.toFixed(2)}</TableCell>
                  <TableCell>৳{settlement.expense_total?.toFixed(2)}</TableCell>
                  <TableCell className={settlement.total_due > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                    ৳{settlement.total_due?.toFixed(2)}
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
