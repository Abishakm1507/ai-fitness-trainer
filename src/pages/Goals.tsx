import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutGoals, GoalType } from '@/hooks/useWorkoutGoals';
import AppNavigation from '@/components/AppNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trash2, Trophy, Flame, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { exercises } from '@/lib/exercises';

const Goals = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { goals, loading, createGoal, deleteGoal, getGoalLabel } = useWorkoutGoals();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    goal_type: 'weekly_workouts' as GoalType,
    exercise_type: '',
    target_value: 0,
    end_date: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = formData.end_date || null;
    const exerciseType = ['exercise_pr_reps', 'exercise_pr_duration'].includes(formData.goal_type) 
      ? formData.exercise_type 
      : null;

    const { error } = await createGoal({
      goal_type: formData.goal_type,
      exercise_type: exerciseType,
      target_value: formData.target_value,
      start_date: startDate,
      end_date: endDate
    });

    if (error) {
      toast.error('Failed to create goal');
    } else {
      toast.success('Goal created!');
      setShowForm(false);
      setFormData({ goal_type: 'weekly_workouts', exercise_type: '', target_value: 0, end_date: '' });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteGoal(id);
    if (error) {
      toast.error('Failed to delete goal');
    } else {
      toast.success('Goal deleted');
    }
  };

  const getGoalIcon = (goalType: GoalType) => {
    switch (goalType) {
      case 'streak': return <Flame className="h-5 w-5 text-orange-500" />;
      case 'exercise_pr_reps':
      case 'exercise_pr_duration': return <Trophy className="h-5 w-5 text-yellow-500" />;
      default: return <Target className="h-5 w-5 text-primary" />;
    }
  };

  const needsExerciseType = ['exercise_pr_reps', 'exercise_pr_duration'].includes(formData.goal_type);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Workout Goals</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Goal Type</Label>
                    <Select 
                      value={formData.goal_type} 
                      onValueChange={(v) => setFormData({ ...formData, goal_type: v as GoalType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly_workouts">Weekly Workouts</SelectItem>
                        <SelectItem value="weekly_reps">Weekly Reps</SelectItem>
                        <SelectItem value="weekly_duration">Weekly Duration (min)</SelectItem>
                        <SelectItem value="exercise_pr_reps">Exercise PR (Reps)</SelectItem>
                        <SelectItem value="exercise_pr_duration">Exercise PR (Duration sec)</SelectItem>
                        <SelectItem value="streak">Workout Streak (days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {needsExerciseType && (
                    <div className="space-y-2">
                      <Label>Exercise</Label>
                      <Select 
                        value={formData.exercise_type} 
                        onValueChange={(v) => setFormData({ ...formData, exercise_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {exercises.map(ex => (
                            <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Target Value</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.target_value || ''}
                      onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date (optional)</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Create Goal</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No goals yet. Create your first goal to start tracking!</p>
              </CardContent>
            </Card>
          ) : (
            goals.map(goal => {
              const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
              const exerciseName = goal.exercise_type 
                ? exercises.find(e => e.id === goal.exercise_type)?.name 
                : null;

              return (
                <Card key={goal.id} className={goal.is_completed ? 'border-green-500 bg-green-500/5' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getGoalIcon(goal.goal_type)}
                        <CardTitle className="text-lg">{getGoalLabel(goal.goal_type)}</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    {exerciseName && (
                      <p className="text-sm text-muted-foreground">{exerciseName}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>{goal.current_value} / {goal.target_value}</span>
                        <span className="text-muted-foreground">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      {goal.is_completed && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <Trophy className="h-4 w-4" />
                          Goal Completed!
                        </div>
                      )}
                      {goal.end_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(goal.end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Goals;
