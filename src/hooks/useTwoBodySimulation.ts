import { useState, useRef, useEffect } from 'react';
import { useTwoBodyPhysics, CelestialBody } from '@/utils/twoBodyPhysics';

export interface TwoBodySimulationState {
  sun: CelestialBody;
  planet: CelestialBody;
  isPaused: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  resetKey: number;
}

export interface TwoBodySimulationActions {
  resetSimulation: () => void;
  handleTogglePause: () => void;
  handleSpeedChange: (speed: number) => void;
  updateSunMass: (newMass: number) => void;
  updatePlanetMass: (newMass: number) => void;
  updateOrbitRadius: (newRadius: number) => void;
}

export function useTwoBodySimulation(
  containerRef: React.RefObject<HTMLDivElement>,
  orbitRadius: number,
  sunMass: number,
  planetMass: number
): [TwoBodySimulationState, TwoBodySimulationActions] {
  const physicsRef = useRef(useTwoBodyPhysics(containerRef, orbitRadius, sunMass, planetMass));
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

  // Adicionei um useEffect para sincronizar as dimensões do container
useEffect(() => {
  const updateDimensions = () => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
      // Reset a simulação quando as dimensões mudam
      physicsRef.current.resetSimulation(orbitRadius, sunMass, planetMass);
    }
  };

  // Atualiza imediatamente e configura o observer
  updateDimensions();
  const resizeObserver = new ResizeObserver(updateDimensions);
  
  if (containerRef.current) {
    resizeObserver.observe(containerRef.current);
  }

  return () => {
    resizeObserver.disconnect();
  };
}, [orbitRadius, sunMass, planetMass]);
  
  const resetSimulation = () => {
    physicsRef.current.resetSimulation(orbitRadius, sunMass, planetMass);
    setIsPaused(true);
    setResetKey(prev => prev + 1);
  };

  const handleTogglePause = () => {
    const paused = physicsRef.current.togglePause();
    setIsPaused(paused);
  };

  const handleSpeedChange = (speed: number) => {
    physicsRef.current.setTimeScale(speed);
  };

  const updateSunMass = (newMass: number) => {
    physicsRef.current.updateSunMass(newMass);
  };
  
  const updatePlanetMass = (newMass: number) => {
    physicsRef.current.updatePlanetMass(newMass);
  };
  
  const updateOrbitRadius = (newRadius: number) => {
    physicsRef.current.updateOrbitRadius(newRadius);
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
      updateSunMass,
      updatePlanetMass,
      updateOrbitRadius
    }
  ];
}