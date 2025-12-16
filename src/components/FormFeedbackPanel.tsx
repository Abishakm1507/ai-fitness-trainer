import React, { useEffect, useState } from 'react';
import { FormFeedback } from '@/types/pose';
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb, Sparkles } from 'lucide-react';

interface FormFeedbackPanelProps {
  feedback: FormFeedback | null;
}

const FormFeedbackPanel: React.FC<FormFeedbackPanelProps> = ({ feedback }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevQuality, setPrevQuality] = useState<string | null>(null);

  // Trigger animation when feedback quality changes
  useEffect(() => {
    if (feedback && feedback.quality !== prevQuality) {
      setIsAnimating(true);
      setPrevQuality(feedback.quality);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [feedback, prevQuality]);

  if (!feedback) {
    return (
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Live Form Coach
        </h3>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium">Ready to analyze your form</p>
            <p className="text-xs text-muted-foreground/70">Start your workout and I'll provide real-time guidance</p>
          </div>
        </div>
      </div>
    );
  }

  const icons = {
    good: <CheckCircle2 className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    bad: <XCircle className="w-6 h-6" />,
  };

  const styles = {
    good: {
      bg: 'bg-success/20',
      border: 'border-success/50',
      text: 'text-success',
      iconBg: 'bg-success/30',
      glow: 'shadow-success/20',
    },
    warning: {
      bg: 'bg-warning/20',
      border: 'border-warning/50',
      text: 'text-warning',
      iconBg: 'bg-warning/30',
      glow: 'shadow-warning/20',
    },
    bad: {
      bg: 'bg-destructive/20',
      border: 'border-destructive/50',
      text: 'text-destructive',
      iconBg: 'bg-destructive/30',
      glow: 'shadow-destructive/20',
    },
  };

  const style = styles[feedback.quality];

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Live Form Coach
      </h3>
      <div
        className={`p-4 rounded-xl ${style.bg} ${style.border} border transition-all duration-300 shadow-lg ${style.glow} ${
          isAnimating ? 'scale-[1.02]' : 'scale-100'
        }`}
      >
        <div className="flex items-start gap-3">
          <div 
            className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center ${style.text} flex-shrink-0 transition-transform duration-300 ${
              isAnimating ? 'rotate-12' : 'rotate-0'
            }`}
          >
            {icons[feedback.quality]}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-lg ${style.text} leading-tight`}>
              {feedback.message}
            </p>
            {feedback.tip && (
              <div className="mt-2 p-2 rounded-lg bg-background/50 border border-border/30">
                <p className="text-sm text-foreground/90 leading-relaxed flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>{feedback.tip}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {feedback.quality === 'warning' && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          💡 Small adjustments make a big difference!
        </p>
      )}
    </div>
  );
};

export default FormFeedbackPanel;
