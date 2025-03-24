
import { useRef, useEffect } from 'react';

// Constantes escaladas para manter a simulação estável
const SCALE_FACTOR = 1e10; // Fator de escala para reduzir os valores
export const G = 6.67408; // G escalado (original 6.67408e-11)

export interface CelestialBody {
  id: string;
  position: { x: number; y: number };
  radius: number;
  color: string;
  mass: number;
  velocity: { x: number; y: number };
  trail: { x: number; y: number }[];
}

export interface TwoBodySimulationState {
  sun: CelestialBody;
  planet: CelestialBody;
  isPaused: boolean;
  timeScale: number;
}

export function useTwoBodyPhysics(
  containerRef: React.RefObject<HTMLDivElement>,
  orbitRadius: number,
  sunMass: number,
  planetMass: number
) {
  // Valores escalados para a simulação
  const BASE_SUN_RADIUS = 15; // Aumentado para ser visualmente maior
  const BASE_PLANET_RADIUS = 5;
  const SCALED_SUN_MASS = 1.98892;    // kg (original 1.98892e30)
  const SCALED_PLANET_MASS = 0.0059742; // kg (original 5.9742e24)
  const TIME_STEP_FACTOR = 5;  // Reduzido para maior estabilidade

  // Função para calcular o raio baseado na massa
  const calculateRadius = (mass: number, baseMass: number, baseRadius: number) => {
    // Usamos raiz cúbica para manter proporção volume/massa
    return baseRadius * Math.pow(mass / baseMass, 1/3);
  };

  const stateRef = useRef<TwoBodySimulationState>({
    sun: {
      id: 'sun',
      position: { x: 0, y: 0 },
      radius: calculateRadius(sunMass || SCALED_SUN_MASS, SCALED_SUN_MASS, BASE_SUN_RADIUS),
      color: '#FDB813',
      mass: sunMass || SCALED_SUN_MASS,
      velocity: { x: 0, y: 0 },
      trail: []
    },
    planet: {
      id: 'planet',
      position: { x: 0, y: 0 },
      radius: calculateRadius(planetMass || SCALED_PLANET_MASS, SCALED_PLANET_MASS, BASE_PLANET_RADIUS),
      color: '#3498db',
      mass: planetMass || SCALED_PLANET_MASS,
      velocity: { x: 0, y: 0 },
      trail: []
    },
    isPaused: true,
    timeScale: 1
  });

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const updateSunMass = (newMass: number) => {
    const stateUpdate = { ...stateRef.current };
    stateUpdate.sun.mass = newMass;
    stateUpdate.sun.radius = calculateRadius(newMass, SCALED_SUN_MASS, BASE_SUN_RADIUS);
    stateRef.current = stateUpdate;
  };
  
  const updatePlanetMass = (newMass: number) => {
    const stateUpdate = { ...stateRef.current };
    stateUpdate.planet.mass = newMass;
    stateUpdate.planet.radius = calculateRadius(newMass, SCALED_PLANET_MASS, BASE_PLANET_RADIUS);
    stateRef.current = stateUpdate;
  };
  
  const updateOrbitRadius = (newRadius: number) => {
    const stateUpdate = { ...stateRef.current };
    const centerX = containerRef.current ? containerRef.current.clientWidth / 2 : 0;
    const centerY = containerRef.current ? containerRef.current.clientHeight / 2 : 0;
  
    stateUpdate.planet.position = { x: centerX + newRadius, y: centerY };
    stateRef.current = stateUpdate;
  };

  // Atualizei a função resetSimulation para calcular corretamente a velocidade orbital
const resetSimulation = (orbitRadius: number, sunMass: number, planetMass: number) => {
  const stateUpdate = { ...stateRef.current };
  const container = containerRef.current;

  if (!container) return;

  const centerX = container.clientWidth / 2;
  const centerY = container.clientHeight / 2;

  // Atualizar massas e raios
  stateUpdate.sun.mass = sunMass;
  stateUpdate.sun.radius = calculateRadius(sunMass, SCALED_SUN_MASS, BASE_SUN_RADIUS);
  stateUpdate.planet.mass = planetMass;
  stateUpdate.planet.radius = calculateRadius(planetMass, SCALED_PLANET_MASS, BASE_PLANET_RADIUS);

  // Posiciona o Sol no centro
  stateUpdate.sun.position = { x: centerX, y: centerY };
  stateUpdate.sun.velocity = { x: 0, y: 0 };
  stateUpdate.sun.trail = [];

  // Calcula a velocidade orbital correta para uma órbita estável
  // v = sqrt(G * M / r)
  const orbitalVelocity = Math.sqrt((G * stateUpdate.sun.mass) / orbitRadius);

  // Posiciona o Planeta na distância correta com velocidade tangencial
  stateUpdate.planet.position = { x: centerX + orbitRadius, y: centerY };
  stateUpdate.planet.velocity = { x: 0, y: orbitalVelocity };
  stateUpdate.planet.trail = [];
  stateUpdate.isPaused = true;
  stateRef.current = stateUpdate;
};

// Atualizei a função updateSimulation para melhorar a física
const updateSimulation = (deltaTime: number) => {
  if (stateRef.current.isPaused) return;

  const state = { ...stateRef.current };
  const timeStep = (deltaTime * state.timeScale * TIME_STEP_FACTOR) / 1000;

  // Calcula a força gravitacional entre o Sol e o Planeta
  const dx = state.planet.position.x - state.sun.position.x;
  const dy = state.planet.position.y - state.sun.position.y;
  const distanceSquared = dx * dx + dy * dy;
  const distance = Math.sqrt(distanceSquared);
  
  // Evita divisão por zero e instabilidades numéricas
  if (distance < 1) return;

  // Cálculo da força gravitacional
  const forceMagnitude = (G * state.sun.mass * state.planet.mass) / distanceSquared;
  const forceDirection = {
    x: dx / distance,
    y: dy / distance
  };

  // Aplica a força ao Planeta (o Sol permanece fixo neste modelo simplificado)
  const acceleration = {
    x: -forceDirection.x * forceMagnitude / state.planet.mass,
    y: -forceDirection.y * forceMagnitude / state.planet.mass
  };

  // Atualiza velocidade e posição usando Verlet integration para maior estabilidade
  const newVelocity = {
    x: state.planet.velocity.x + acceleration.x * timeStep,
    y: state.planet.velocity.y + acceleration.y * timeStep
  };

  state.planet.position.x += (state.planet.velocity.x + newVelocity.x) * 0.5 * timeStep;
  state.planet.position.y += (state.planet.velocity.y + newVelocity.y) * 0.5 * timeStep;
  state.planet.velocity = newVelocity;

  // Atualiza a trilha do Planeta
  state.planet.trail.push({ ...state.planet.position });
  if (state.planet.trail.length > 200) {
    state.planet.trail.shift();
  }

  stateRef.current = state;
};

  const animate = (time: number) => {
    const deltaTime = lastTimeRef.current ? (time - lastTimeRef.current) / 16.666 : 1;
    lastTimeRef.current = time;

    updateSimulation(deltaTime);

    if (!stateRef.current.isPaused) {
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    resetSimulation(orbitRadius, sunMass, planetMass);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const togglePause = () => {
    stateRef.current.isPaused = !stateRef.current.isPaused;

    if (!stateRef.current.isPaused) {
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(animate);
    }

    return stateRef.current.isPaused;
  };

  const setTimeScale = (scale: number) => {
    stateRef.current.timeScale = scale;
  };

  return {
    getState: () => ({ ...stateRef.current }),
    resetSimulation,
    togglePause,
    setTimeScale,
    updateSunMass,
    updatePlanetMass,
    updateOrbitRadius
  };
}
