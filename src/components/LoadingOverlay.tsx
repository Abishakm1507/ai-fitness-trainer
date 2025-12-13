import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message = 'Loading AI Model...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass-card-elevated p-8 text-center max-w-sm mx-4 animate-scale-in">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <div className="pulse-ring bg-primary/20" />
          <div className="pulse-ring bg-primary/10" style={{ animationDelay: '0.5s' }} />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">{message}</h2>
        <p className="text-sm text-muted-foreground">
          Initializing pose detection model for real-time tracking
        </p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
