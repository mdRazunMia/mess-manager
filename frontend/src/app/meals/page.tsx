'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';

function useMeals(date: string) {
  return useQuery({
    queryKey: ['meals', date],
    queryFn: () => api.get(`/meals?date=${date}`),
  });
}

function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/members?status=active'),
  });
}

export default function MealsPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data: meals, isLoading: mealsLoading } = useMeals(date);
  const { data: members } = useMembers();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.post('/meals/bulk', [data]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', date] });
      toast.success('Meal updated');
    },
  });

  const handleToggle = (memberId: number, mealId: number, type: string, value: boolean) => {
    updateMutation.mutate({
      member_id: memberId,
      date: date,
      [type]: value,
    });
  };

  if (mealsLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meal Management</h1>
        <p className="text-muted-foreground">Track daily meals for each member</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <span>Daily Meal Entry</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Member</th>
                  <th className="text-center py-3 px-4 font-medium">Breakfast (0.5)</th>
                  <th className="text-center py-3 px-4 font-medium">Lunch (1.0)</th>
                  <th className="text-center py-3 px-4 font-medium">Dinner (1.0)</th>
                </tr>
              </thead>
              <tbody>
                {meals?.map((meal: any) => (
                  <tr key={meal.id} className="border-b last:border-0">
                    <td className="py-3 px-4">{meal.member?.name}</td>
                    <td className="text-center py-3 px-4">
                      <Checkbox
                        checked={meal.breakfast}
                        onCheckedChange={(checked) =>
                          handleToggle(meal.member_id, meal.id, 'breakfast', checked as boolean)
                        }
                      />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Checkbox
                        checked={meal.lunch}
                        onCheckedChange={(checked) =>
                          handleToggle(meal.member_id, meal.id, 'lunch', checked as boolean)
                        }
                      />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Checkbox
                        checked={meal.dinner}
                        onCheckedChange={(checked) =>
                          handleToggle(meal.member_id, meal.id, 'dinner', checked as boolean)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
