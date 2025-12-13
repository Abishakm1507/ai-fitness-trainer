import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pose, FormQuality } from '@/types/pose';
import { SKELETON_CONNECTIONS } from '@/lib/exercises';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraFeedProps {
  onVideoReady: (video: HTMLVideoElement) => void;
  onVideoStop: () => void;
  pose: Pose | null;
  formQuality: FormQuality;
  isActive: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({
  onVideoReady,
  onVideoStop,
  pose,
  formQuality,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        onVideoReady(videoRef.current);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  }, [onVideoReady]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    onVideoStop();
  }, [onVideoStop]);

  // Draw skeleton overlay
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !pose || !isCameraActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set colors based on form quality
    const colors = {
      good: '#00e5cc',
      warning: '#f59e0b',
      bad: '#ef4444',
    };
    const strokeColor = colors[formQuality];
    const pointColor = formQuality === 'good' ? '#00e5cc' : formQuality === 'warning' ? '#f59e0b' : '#ef4444';

    // Draw connections
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    SKELETON_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = pose.keypoints[startIdx];
      const end = pose.keypoints[endIdx];

      if (start && end && (start.score || 0) > 0.3 && (end.score || 0) > 0.3) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    });

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if ((keypoint.score || 0) > 0.3) {
        // Outer glow
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = `${pointColor}40`;
        ctx.fill();

        // Inner point
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = pointColor;
        ctx.fill();

        // White center
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    });
  }, [pose, formQuality, isCameraActive]);

  // Auto-start camera when active
  useEffect(() => {
    if (isActive && !isCameraActive) {
      startCamera();
    } else if (!isActive && isCameraActive) {
      stopCamera();
    }
  }, [isActive, isCameraActive, startCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="relative w-full aspect-[4/3] bg-secondary rounded-2xl overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Canvas overlay for skeleton */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Camera inactive state */}
      {!isCameraActive && !cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <Camera className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="pulse-ring bg-primary/20" />
          </div>
          <p className="text-muted-foreground text-lg mb-4">Camera is off</p>
          <Button onClick={startCamera} variant="default" size="lg" className="gap-2">
            <Camera className="w-5 h-5" />
            Start Camera
          </Button>
        </div>
      )}

      {/* Error state */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary">
          <CameraOff className="w-16 h-16 text-destructive mb-4" />
          <p className="text-destructive text-center px-8 mb-4">{cameraError}</p>
          <Button onClick={startCamera} variant="outline" size="lg" className="gap-2">
            <RefreshCw className="w-5 h-5" />
            Try Again
          </Button>
        </div>
      )}

      {/* Form quality indicator */}
      {isCameraActive && pose && (
        <div
          className={`absolute top-4 left-4 px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
            formQuality === 'good'
              ? 'bg-success/20 border-success/50 text-success'
              : formQuality === 'warning'
              ? 'bg-warning/20 border-warning/50 text-warning'
              : 'bg-destructive/20 border-destructive/50 text-destructive'
          }`}
        >
          <span className="font-semibold text-sm">
            {formQuality === 'good' ? '✓ Good Form' : formQuality === 'warning' ? '⚠ Check Form' : '✗ Fix Form'}
          </span>
        </div>
      )}

      {/* Camera controls */}
      {isCameraActive && (
        <button
          onClick={stopCamera}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-destructive/80 hover:bg-destructive flex items-center justify-center transition-colors"
        >
          <CameraOff className="w-5 h-5 text-destructive-foreground" />
        </button>
      )}
    </div>
  );
};

export default CameraFeed;
