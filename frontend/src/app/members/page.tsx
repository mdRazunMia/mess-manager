'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format, getDaysInMonth } from 'date-fns';

function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/members'),
  });
}

function useMemberMeals(memberId: number, month: number, year: number) {
  return useQuery({
    queryKey: ['member-meals', memberId, month, year],
    queryFn: () => api.get(`/meals?member_id=${memberId}&month=${month}&year=${year}`),
    enabled: !!memberId,
  });
}

function useMemberStatement(memberId: number, month: number, year: number) {
  return useQuery({
    queryKey: ['member-statement', memberId, month, year],
    queryFn: () => api.get(`/members/${memberId}/statement?month=${month}&year=${year}`),
    enabled: !!memberId,
  });
}

function getDaysArray(year: number, month: number) {
  const days = getDaysInMonth(new Date(year, month - 1));
  const arr: Date[] = [];
  for (let i = 1; i <= days; i++) {
    arr.push(new Date(year, month - 1, i));
  }
  return arr;
}

export default function MembersPage() {
  const { data: members, isLoading } = useMembers();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    room_no: '',
    rent: '',
    join_date: '',
  });

  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [mealMonth, setMealMonth] = useState(() => new Date().getMonth() + 1);
  const [mealYear, setMealYear] = useState(() => new Date().getFullYear());
  const [mealDraft, setMealDraft] = useState<Record<string, { breakfast: boolean; lunch: boolean; dinner: boolean }>>({});

  const [statementDialogOpen, setStatementDialogOpen] = useState(false);
  const [stmtMonth, setStmtMonth] = useState(() => new Date().getMonth() + 1);
  const [stmtYear, setStmtYear] = useState(() => new Date().getFullYear());

  const { data: memberMeals } = useMemberMeals(
    selectedMember?.id,
    mealMonth,
    mealYear
  );

  const { data: statement } = useMemberStatement(
    selectedMember?.id,
    stmtMonth,
    stmtYear
  );

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/members', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member added successfully');
      setOpen(false);
      setForm({ name: '', email: '', phone: '', room_no: '', rent: '', join_date: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add member');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => api.post(`/members/${id}/toggle`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member status updated');
    },
  });

  const saveMealsMutation = useMutation({
    mutationFn: (data: any[]) => api.post('/meals/bulk', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-meals', selectedMember?.id, mealMonth, mealYear] });
      toast.success('Meals saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save meals');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      rent: parseFloat(form.rent) || 0,
      join_date: form.join_date ? new Date(form.join_date).toISOString() : new Date().toISOString(),
    });
  };

  const openMealDialog = (member: any) => {
    setSelectedMember(member);
    setMealMonth(new Date().getMonth() + 1);
    setMealYear(new Date().getFullYear());
    setMealDraft({});
    setMealDialogOpen(true);
  };

  const openStatementDialog = (member: any) => {
    setSelectedMember(member);
    setStmtMonth(new Date().getMonth() + 1);
    setStmtYear(new Date().getFullYear());
    setStatementDialogOpen(true);
  };

  const getMealForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (mealDraft[dateStr] !== undefined) {
      return mealDraft[dateStr];
    }
    const existing = memberMeals?.find((m: any) => {
      const d = new Date(m.date);
      return format(d, 'yyyy-MM-dd') === dateStr;
    });
    if (existing) {
      return {
        breakfast: existing.breakfast,
        lunch: existing.lunch,
        dinner: existing.dinner,
      };
    }
    return { breakfast: false, lunch: false, dinner: false };
  };

  const toggleMeal = (date: Date, type: 'breakfast' | 'lunch' | 'dinner') => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const current = getMealForDay(date);
    setMealDraft((prev) => ({
      ...prev,
      [dateStr]: {
        ...current,
        [type]: !current[type],
      },
    }));
  };

  const handleSaveMeals = () => {
    if (!selectedMember) return;
    const days = getDaysArray(mealYear, mealMonth);
    const payload = days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const state = getMealForDay(date);
      return {
        member_id: selectedMember.id,
        date: dateStr,
        breakfast: state.breakfast,
        lunch: state.lunch,
        dinner: state.dinner,
      };
    });
    saveMealsMutation.mutate(payload);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage all mess members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>Add Member</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input
                  id="room"
                  value={form.room_no}
                  onChange={(e) => setForm({ ...form, room_no: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent</Label>
                <Input
                  id="rent"
                  type="number"
                  value={form.rent}
                  onChange={(e) => setForm({ ...form, rent: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="join_date">Joining Date</Label>
                <Input
                  id="join_date"
                  type="date"
                  value={form.join_date}
                  onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Member'}
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.room_no}</TableCell>
                  <TableCell>৳{member.rent}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMutation.mutate(member.id)}
                      disabled={toggleMutation.isPending}
                    >
                      {member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openMealDialog(member)}
                    >
                      Meals
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openStatementDialog(member)}
                    >
                      Statement
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Meal Dialog */}
      <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Meals for {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={mealMonth}
                  onChange={(e) => setMealMonth(Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={mealYear}
                  onChange={(e) => setMealYear(Number(e.target.value))}
                  className="w-24"
                />
              </div>
              <Button
                onClick={handleSaveMeals}
                disabled={saveMealsMutation.isPending}
              >
                {saveMealsMutation.isPending ? 'Saving...' : 'Save All'}
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-2 px-3 font-medium">Date</th>
                    <th className="text-center py-2 px-3 font-medium">Breakfast</th>
                    <th className="text-center py-2 px-3 font-medium">Lunch</th>
                    <th className="text-center py-2 px-3 font-medium">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {getDaysArray(mealYear, mealMonth).map((date) => {
                    const meal = getMealForDay(date);
                    return (
                      <tr key={date.toISOString()} className="border-b last:border-0">
                        <td className="py-2 px-3 whitespace-nowrap">
                          {format(date, 'MMM dd, EEE')}
                        </td>
                        <td className="text-center py-2 px-3">
                          <Checkbox
                            checked={meal.breakfast}
                            onCheckedChange={() => toggleMeal(date, 'breakfast')}
                          />
                        </td>
                        <td className="text-center py-2 px-3">
                          <Checkbox
                            checked={meal.lunch}
                            onCheckedChange={() => toggleMeal(date, 'lunch')}
                          />
                        </td>
                        <td className="text-center py-2 px-3">
                          <Checkbox
                            checked={meal.dinner}
                            onCheckedChange={() => toggleMeal(date, 'dinner')}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Statement Dialog */}
      <Dialog open={statementDialogOpen} onOpenChange={setStatementDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Statement for {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={stmtMonth}
                  onChange={(e) => setStmtMonth(Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={stmtYear}
                  onChange={(e) => setStmtYear(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>

            {statement && (
              <div className="space-y-4">
                {/* Meal Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Meal Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Breakfast</div>
                        <div className="font-medium">{statement.meals?.breakfast ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Lunch</div>
                        <div className="font-medium">{statement.meals?.lunch ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Dinner</div>
                        <div className="font-medium">{statement.meals?.dinner ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Weighted Meals</div>
                        <div className="font-medium">{statement.meals?.weighted ?? 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Meal Cost</span>
                        <span className="font-medium">৳{statement.meal_cost ?? 0}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Meal Rate</span>
                        <span className="font-medium">৳{statement.meal_rate ?? 0}/meal</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Rent</span>
                        <span className="font-medium">৳{statement.rent ?? 0}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Utility Share</span>
                        <span className="font-medium">৳{statement.utility_share ?? 0}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Total Payments</span>
                        <span className="font-medium text-green-600">৳{statement.payments?.total ?? 0}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="font-medium">Total Due</span>
                        <span className={`font-bold ${statement.total_due > 0 ? 'text-red-600' : statement.total_due < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                          ৳{Math.abs(statement.total_due ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status</span>
                        <Badge variant={statement.status === 'give_taka' ? 'destructive' : statement.status === 'back_taka' ? 'default' : 'secondary'}>
                          {statement.status_label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Expense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Food (Market)</span>
                        <span className="font-medium">৳{statement.total_expenses?.food ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Utilities</span>
                        <span className="font-medium">৳{statement.total_expenses?.utility ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Other</span>
                        <span className="font-medium">৳{statement.total_expenses?.other ?? 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 font-medium">Date</th>
                            <th className="text-left py-2 px-2 font-medium">Method</th>
                            <th className="text-right py-2 px-2 font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statement.payments?.list?.length > 0 ? (
                            statement.payments.list.map((p: any) => (
                              <tr key={p.id} className="border-b last:border-0">
                                <td className="py-2 px-2">{format(new Date(p.payment_date), 'dd MMM yyyy')}</td>
                                <td className="py-2 px-2 capitalize">{p.method}</td>
                                <td className="py-2 px-2 text-right font-medium">৳{p.amount}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-3 text-center text-muted-foreground">
                                No payments recorded this month
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
