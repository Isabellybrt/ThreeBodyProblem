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
  updateSunMass: (newMass: number) => void;      // Adicionar função para atualizar a massa do Sol
  updatePlanetMass: (newMass: number) => void;   // Adicionar função para atualizar a massa do Planeta
  updateOrbitRadius: (newRadius: number) => void; // Adicionar função para atualizar a distância orbital
  updateGravity: (newGravity: number) => void;    // Adicionar função para atualizar a gravidade
}

export function useTwoBodySimulation(
  containerRef: React.RefObject<HTMLDivElement>,
  orbitRadius: number,
  sunMass: number,
  planetMass: number,
  gravity: number
): [TwoBodySimulationState, TwoBodySimulationActions] {
  const physicsRef = useRef(useTwoBodyPhysics(containerRef, orbitRadius, sunMass, planetMass, gravity));
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

  useEffect(() => {
    // Atualizar a simulação com os novos parâmetros
    physicsRef.current.resetSimulation(orbitRadius, sunMass, planetMass, gravity);
    // Manter a simulação pausada enquanto os parâmetros são ajustados
    setIsPaused(true);
  }, [orbitRadius, sunMass, planetMass, gravity]);
  
  const resetSimulation = () => {
    physicsRef.current.resetSimulation(orbitRadius, sunMass, planetMass, gravity); // Passando os argumentos
    setIsPaused(true); // Forçar o estado isPaused para true após o reset
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
  
  const updateGravity = (newGravity: number) => {
    physicsRef.current.updateGravity(newGravity);
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
      updateSunMass,      // Retornar a função para atualizar a massa do Sol
      updatePlanetMass,   // Retornar a função para atualizar a massa do Planeta
      updateOrbitRadius,  // Retornar a função para atualizar a distância orbital
      updateGravity       // Retornar a função para atualizar a gravidade
    }
  ];
}