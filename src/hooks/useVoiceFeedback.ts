import { useCallback, useRef, useEffect, useState } from 'react';
import { FormFeedback } from '@/types/pose';

interface UseVoiceFeedbackOptions {
  enabled?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useVoiceFeedback = (options: UseVoiceFeedbackOptions = {}) => {
  const { enabled = true, rate = 1.0, pitch = 1.0, volume = 1.0 } = options;
  const lastSpokenMessage = useRef<string>('');
  const lastSpokenTime = useRef<number>(0);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !enabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, enabled, rate, pitch, volume]);

  const speakFeedback = useCallback((feedback: FormFeedback | null) => {
    if (!feedback || !enabled || !isSupported) return;

    const now = Date.now();
    const minInterval = 3000; // Don't repeat same message within 3 seconds

    // Only speak if it's a different message or enough time has passed
    if (
      feedback.message === lastSpokenMessage.current &&
      now - lastSpokenTime.current < minInterval
    ) {
      return;
    }

    // Prioritize warnings and bad form - speak the tip for corrections
    if (feedback.quality === 'bad' || feedback.quality === 'warning') {
      const textToSpeak = feedback.tip || feedback.message;
      speak(textToSpeak);
      lastSpokenMessage.current = feedback.message;
      lastSpokenTime.current = now;
    } else if (feedback.quality === 'good') {
      // Occasionally encourage good form (not every time)
      if (now - lastSpokenTime.current > 10000) {
        speak(feedback.message);
        lastSpokenMessage.current = feedback.message;
        lastSpokenTime.current = now;
      }
    }
  }, [enabled, isSupported, speak]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    speakFeedback,
    stop,
    isSupported,
    isSpeaking,
  };
};
