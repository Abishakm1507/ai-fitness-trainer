import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExerciseType } from '@/types/pose';
import { HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ExerciseTutorialProps {
  exercise: ExerciseType;
}

const exerciseTips: Record<ExerciseType, { dos: string[]; donts: string[] }> = {
  squats: {
    dos: [
      'Keep your feet shoulder-width apart',
      'Push your hips back as you lower',
      'Keep your chest up and core tight',
      'Drive through your heels to stand'
    ],
    donts: [
      'Let your knees cave inward',
      'Round your lower back',
      'Rise onto your toes',
      'Rush through the movement'
    ]
  },
  pushups: {
    dos: [
      'Keep your body in a straight line',
      'Position hands slightly wider than shoulders',
      'Lower chest to near the ground',
      'Keep elbows at 45° angle'
    ],
    donts: [
      'Let your hips sag or pike up',
      'Flare elbows out to 90°',
      'Rush through reps',
      'Hold your breath'
    ]
  },
  'bicep-curls': {
    dos: [
      'Keep upper arms stationary',
      'Control the weight on the way down',
      'Squeeze at the top of the curl',
      'Keep wrists straight'
    ],
    donts: [
      'Swing your body for momentum',
      'Let elbows drift forward',
      'Rush the eccentric phase',
      'Use too heavy of a weight'
    ]
  },
  lunges: {
    dos: [
      'Step far enough forward',
      'Lower until back knee nearly touches floor',
      'Keep front knee over ankle',
      'Maintain upright torso'
    ],
    donts: [
      'Let front knee go past toes',
      'Lean forward excessively',
      'Take too short of a step',
      'Let your hips drop unevenly'
    ]
  }
};

const AnimatedSquat: React.FC = () => (
  <svg viewBox="0 0 200 200" className="w-full h-48">
    {/* Standing figure */}
    <g className="animate-squat-figure">
      {/* Head */}
      <circle cx="100" cy="30" r="15" fill="currentColor" className="text-primary" />
      {/* Body */}
      <line x1="100" y1="45" x2="100" y2="90" stroke="currentColor" strokeWidth="4" className="text-primary" />
      {/* Arms */}
      <line x1="100" y1="55" x2="70" y2="75" stroke="currentColor" strokeWidth="3" className="text-primary" />
      <line x1="100" y1="55" x2="130" y2="75" stroke="currentColor" strokeWidth="3" className="text-primary" />
      {/* Upper legs */}
      <line x1="100" y1="90" x2="80" y2="130" stroke="currentColor" strokeWidth="4" className="text-primary animate-squat-left-thigh" />
      <line x1="100" y1="90" x2="120" y2="130" stroke="currentColor" strokeWidth="4" className="text-primary animate-squat-right-thigh" />
      {/* Lower legs */}
      <line x1="80" y1="130" x2="75" y2="175" stroke="currentColor" strokeWidth="4" className="text-primary animate-squat-left-shin" />
      <line x1="120" y1="130" x2="125" y2="175" stroke="currentColor" strokeWidth="4" className="text-primary animate-squat-right-shin" />
    </g>
    {/* Floor line */}
    <line x1="40" y1="180" x2="160" y2="180" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" strokeDasharray="5,5" />
  </svg>
);

const AnimatedPushup: React.FC = () => (
  <svg viewBox="0 0 250 120" className="w-full h-32">
    <g className="animate-pushup-figure">
      {/* Head */}
      <circle cx="40" cy="35" r="12" fill="currentColor" className="text-primary animate-pushup-head" />
      {/* Body */}
      <line x1="52" y1="35" x2="160" y2="50" stroke="currentColor" strokeWidth="4" className="text-primary animate-pushup-body" />
      {/* Arms */}
      <line x1="70" y1="42" x2="70" y2="90" stroke="currentColor" strokeWidth="3" className="text-primary animate-pushup-arm" />
      {/* Legs */}
      <line x1="160" y1="50" x2="220" y2="65" stroke="currentColor" strokeWidth="4" className="text-primary" />
      {/* Feet */}
      <circle cx="220" cy="65" r="5" fill="currentColor" className="text-primary" />
    </g>
    {/* Floor */}
    <line x1="20" y1="95" x2="230" y2="95" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" strokeDasharray="5,5" />
  </svg>
);

const AnimatedBicepCurl: React.FC = () => (
  <svg viewBox="0 0 150 200" className="w-full h-48">
    {/* Body */}
    <g>
      {/* Head */}
      <circle cx="75" cy="30" r="15" fill="currentColor" className="text-primary" />
      {/* Torso */}
      <line x1="75" y1="45" x2="75" y2="110" stroke="currentColor" strokeWidth="4" className="text-primary" />
      {/* Left arm (stationary) */}
      <line x1="75" y1="55" x2="45" y2="110" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
      {/* Right upper arm */}
      <line x1="75" y1="55" x2="105" y2="85" stroke="currentColor" strokeWidth="3" className="text-primary" />
      {/* Right forearm (animated) */}
      <line x1="105" y1="85" x2="105" y2="130" stroke="currentColor" strokeWidth="3" className="text-accent animate-curl-forearm" style={{ transformOrigin: '105px 85px' }} />
      {/* Weight */}
      <rect x="98" y="125" width="14" height="20" rx="2" fill="currentColor" className="text-accent animate-curl-weight" style={{ transformOrigin: '105px 85px' }} />
      {/* Legs */}
      <line x1="75" y1="110" x2="55" y2="175" stroke="currentColor" strokeWidth="4" className="text-primary" />
      <line x1="75" y1="110" x2="95" y2="175" stroke="currentColor" strokeWidth="4" className="text-primary" />
    </g>
    {/* Floor */}
    <line x1="30" y1="180" x2="120" y2="180" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" strokeDasharray="5,5" />
  </svg>
);

const AnimatedLunge: React.FC = () => (
  <svg viewBox="0 0 200 200" className="w-full h-48">
    <g className="animate-lunge-figure">
      {/* Head */}
      <circle cx="100" cy="25" r="12" fill="currentColor" className="text-primary animate-lunge-head" />
      {/* Torso */}
      <line x1="100" y1="37" x2="100" y2="85" stroke="currentColor" strokeWidth="4" className="text-primary animate-lunge-torso" />
      {/* Arms */}
      <line x1="100" y1="50" x2="80" y2="75" stroke="currentColor" strokeWidth="3" className="text-primary" />
      <line x1="100" y1="50" x2="120" y2="75" stroke="currentColor" strokeWidth="3" className="text-primary" />
      {/* Front leg */}
      <line x1="100" y1="85" x2="70" y2="130" stroke="currentColor" strokeWidth="4" className="text-primary animate-lunge-front-thigh" />
      <line x1="70" y1="130" x2="60" y2="175" stroke="currentColor" strokeWidth="4" className="text-primary animate-lunge-front-shin" />
      {/* Back leg */}
      <line x1="100" y1="85" x2="140" y2="120" stroke="currentColor" strokeWidth="4" className="text-primary animate-lunge-back-thigh" />
      <line x1="140" y1="120" x2="160" y2="165" stroke="currentColor" strokeWidth="4" className="text-primary animate-lunge-back-shin" />
    </g>
    {/* Floor */}
    <line x1="30" y1="180" x2="180" y2="180" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" strokeDasharray="5,5" />
  </svg>
);

const exerciseAnimations: Record<ExerciseType, React.FC> = {
  squats: AnimatedSquat,
  pushups: AnimatedPushup,
  'bicep-curls': AnimatedBicepCurl,
  lunges: AnimatedLunge
};

const exerciseNames: Record<ExerciseType, string> = {
  squats: 'Squats',
  pushups: 'Push-ups',
  'bicep-curls': 'Bicep Curls',
  lunges: 'Lunges'
};

const ExerciseTutorial: React.FC<ExerciseTutorialProps> = ({ exercise }) => {
  const [isOpen, setIsOpen] = useState(false);
  const AnimationComponent = exerciseAnimations[exercise];
  const tips = exerciseTips[exercise];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Form Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {exerciseNames[exercise]} Form Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Animation */}
          <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-center">
            <AnimationComponent />
          </div>

          {/* Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Do's */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-green-500">
                <CheckCircle className="h-4 w-4" />
                Do
              </h4>
              <ul className="space-y-1.5">
                {tips.dos.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Don't
              </h4>
              <ul className="space-y-1.5">
                {tips.donts.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            The AI will monitor your form during the workout and provide real-time corrections.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseTutorial;