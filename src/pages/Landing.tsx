import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell, Sparkles, Target, TrendingUp, Trophy, Zap, ArrowRight, Activity } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">FitAI</span>
          </div>
          <Link to="/auth">
            <Button variant="outline" className="gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Fitness Coaching</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Transform Your Workout
            <br />
            <span className="gradient-text">With Real-Time AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Get instant feedback on your form, track your reps automatically, and beat your personal records with our intelligent fitness trainer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-lg px-8 py-6 glow-primary">
                Start Training
                <Zap className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Why Choose FitAI?
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Advanced computer vision technology that helps you train smarter, not just harder.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Activity className="w-6 h-6" />}
              title="Form Analysis"
              description="Real-time feedback on your exercise form to prevent injuries and maximize results."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Auto Rep Counting"
              description="AI automatically counts your reps so you can focus on your workout."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Progress Tracking"
              description="Track your workouts over time and visualize your fitness journey."
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="Personal Records"
              description="Get notified when you beat your previous bests and celebrate your wins."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card-elevated p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Level Up Your Fitness?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join now and start training with your personal AI fitness coach. No equipment needed, just your body and a camera.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-lg px-8 py-6 glow-primary">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">FitAI Trainer</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by TensorFlow.js MoveNet
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="glass-card p-6 hover:border-primary/50 transition-colors">
    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Landing;
