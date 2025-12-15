import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { Dumbbell, Flame, Clock, Target, TrendingUp, Loader2 } from 'lucide-react';
import AppNavigation from '@/components/AppNavigation';

const History: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { workouts, loading, getStats, getChartData } = useWorkoutHistory();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const stats = getStats();
  const chartData = getChartData();

  const chartConfig = {
    reps: { label: 'Reps', color: 'hsl(var(--primary))' },
    calories: { label: 'Calories', color: 'hsl(var(--accent))' },
    duration: { label: 'Duration (min)', color: 'hsl(var(--secondary))' }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <AppNavigation />

      {/* Page Title */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-foreground">Workout History</h2>
        <p className="text-sm text-muted-foreground">Track your progress over time</p>
      </div>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">Workouts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalReps}</p>
                  <p className="text-xs text-muted-foreground">Total Reps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Math.round(stats.totalCalories)}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Math.floor(stats.totalDuration / 60)}</p>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-lg">Reps Over Time</CardTitle>
                <CardDescription>Your rep count progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="repsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="reps"
                      stroke="hsl(var(--primary))"
                      fill="url(#repsGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="text-lg">Calories Burned</CardTitle>
                <CardDescription>Daily calorie expenditure</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <BarChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="calories" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No workouts yet</h3>
              <p className="text-muted-foreground mb-4">Complete your first workout to see your progress here!</p>
              <Link to="/dashboard">
                <Button>Start Workout</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recent Workouts */}
        {workouts.length > 0 && (
          <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="text-lg">Recent Workouts</CardTitle>
              <CardDescription>Your latest workout sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workouts.slice(0, 10).map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">{workout.exercise_type.replace('-', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(workout.created_at).toLocaleDateString()} at{' '}
                          {new Date(workout.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="font-medium text-foreground">{workout.total_reps} reps</p>
                        <p className="text-xs text-muted-foreground">{formatDuration(workout.duration_seconds)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-warning">{Math.round(Number(workout.calories_burned))} cal</p>
                        <p className="text-xs text-muted-foreground">{Math.round(Number(workout.form_score))}% form</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default History;
