import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dumbbell, Home, History, LogOut, User, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const AppNavigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'See you next time!',
    });
  };

  const navItems = [
    { to: '/dashboard', label: 'Workout', icon: Home },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <header className="max-w-7xl mx-auto mb-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                FitAI Trainer
                <Sparkles className="w-5 h-5 text-primary" />
              </h1>
              <p className="text-sm text-muted-foreground">Real-time AI-powered fitness coaching</p>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 mr-4">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2",
                    location.pathname === item.to && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    location.pathname === item.to && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Active</span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
          
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppNavigation;
