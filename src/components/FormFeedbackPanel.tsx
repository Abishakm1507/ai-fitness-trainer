import React from 'react';
import { FormFeedback } from '@/types/pose';
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

interface FormFeedbackPanelProps {
  feedback: FormFeedback | null;
}

const FormFeedbackPanel: React.FC<FormFeedbackPanelProps> = ({ feedback }) => {
  if (!feedback) {
    return (
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Form Feedback
        </h3>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <p className="text-sm">Start exercising to receive feedback</p>
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
    },
    warning: {
      bg: 'bg-warning/20',
      border: 'border-warning/50',
      text: 'text-warning',
      iconBg: 'bg-warning/30',
    },
    bad: {
      bg: 'bg-destructive/20',
      border: 'border-destructive/50',
      text: 'text-destructive',
      iconBg: 'bg-destructive/30',
    },
  };

  const style = styles[feedback.quality];

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        Form Feedback
      </h3>
      <div
        className={`p-4 rounded-xl ${style.bg} ${style.border} border transition-all duration-300 animate-fade-in`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center ${style.text}`}>
            {icons[feedback.quality]}
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${style.text}`}>{feedback.message}</p>
            {feedback.tip && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                {feedback.tip}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormFeedbackPanel;
