import { useState, useRef, useEffect } from 'react';
import { useRotationPhysics, RotatingBody } from '@/utils/rotationPhysics';

export interface RotationSimulationState {
  sun: RotatingBody;
  planet: RotatingBody;
  moon: RotatingBody;
  isPaused: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  resetKey: number;
}

export interface RotationSimulationActions {
  resetSimulation: () => void;
  handleTogglePause: () => void;
  handleSpeedChange: (speed: number) => void;
  handleRotationSpeedChange: (bodyId: string, speed: number) => void;
  handleOrbitSpeedChange: (bodyId: string, speed: number) => void;
}

export function useRotationSimulation(containerRef: React.RefObject<HTMLDivElement>): [RotationSimulationState, RotationSimulationActions] {
  const physicsRef = useRef(useRotationPhysics(containerRef));
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [resetKey, setResetKey] = useState<number>(0);

  const handleResize = () => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const resetSimulation = () => {
    physicsRef.current.resetSimulation();
    setResetKey(prev => prev + 1);
  };

  const handleTogglePause = () => {
    const paused = physicsRef.current.togglePause();
    setIsPaused(paused);
  };

  const handleSpeedChange = (speed: number) => {
    physicsRef.current.setTimeScale(speed);
  };

  const handleRotationSpeedChange = (bodyId: string, speed: number) => {
    physicsRef.current.setRotationSpeed(bodyId, speed);
  };

  const handleOrbitSpeedChange = (bodyId: string, speed: number) => {
    physicsRef.current.setOrbitSpeed(bodyId, speed);
  };

  return [
    {
      ...physicsRef.current.getState(),
      dimensions,
      isPaused,
      resetKey
    },
    {
      resetSimulation,
      handleTogglePause,
      handleSpeedChange,
      handleRotationSpeedChange,
      handleOrbitSpeedChange
    }
  ];
}