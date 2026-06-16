'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { Users, DollarSign, Utensils, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';

function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard'),
  });
}

function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/dashboard/stats'),
  });
}

export default function DashboardPage() {
  const { data: dashboard } = useDashboard();
  const { data: stats } = useStats();

  const cards = [
    {
      title: 'Total Members',
      value: dashboard?.total_members ?? 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Expenses',
      value: `৳${(dashboard?.total_expenses ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-red-500',
    },
    {
      title: 'Current Meal Rate',
      value: `৳${(dashboard?.current_meal_rate ?? 0).toFixed(2)}`,
      icon: Utensils,
      color: 'bg-green-500',
    },
    {
      title: 'Current Month Meals',
      value: (dashboard?.current_month_meals ?? 0).toFixed(1),
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Collections',
      value: `৳${(dashboard?.total_collections ?? 0).toFixed(2)}`,
      icon: CreditCard,
      color: 'bg-emerald-500',
    },
    {
      title: 'Pending Dues',
      value: `৳${(dashboard?.pending_dues ?? 0).toFixed(2)}`,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your mess management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`${card.color} p-2 rounded-md text-white`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.expense_trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.meal_trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="breakfast" stroke="#f59e0b" />
                <Line type="monotone" dataKey="lunch" stroke="#3b82f6" />
                <Line type="monotone" dataKey="dinner" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.collection_trend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
