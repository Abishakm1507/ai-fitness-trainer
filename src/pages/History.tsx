import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Dumbbell, ArrowLeft, Flame, Clock, Target, TrendingUp, Loader2 } from 'lucide-react';

const History: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { workouts, loading, getStats, getChartData } = useWorkoutHistory();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Workout History</h1>
              <p className="text-sm text-muted-foreground">Track your progress over time</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="glass-effect border-white/10">
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

          <Card className="glass-effect border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalReps}</p>
                  <p className="text-xs text-muted-foreground">Total Reps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Math.round(stats.totalCalories)}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
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
            <Card className="glass-effect border-white/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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

            <Card className="glass-effect border-white/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
          <Card className="glass-effect border-white/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No workouts yet</h3>
              <p className="text-muted-foreground mb-4">Complete your first workout to see your progress here!</p>
              <Link to="/">
                <Button>Start Workout</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recent Workouts */}
        {workouts.length > 0 && (
          <Card className="glass-effect border-white/10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="text-lg">Recent Workouts</CardTitle>
              <CardDescription>Your latest workout sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workouts.slice(0, 10).map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
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
                        <p className="font-medium text-orange-500">{Math.round(Number(workout.calories_burned))} cal</p>
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
