import { useRef, useEffect } from 'react';

export const G = 1;

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
  G: number; 
}

export function useTwoBodyPhysics(
  containerRef: React.RefObject<HTMLDivElement>,
  orbitRadius: number,
  sunMass: number,
  planetMass: number,
  gravity: number
) {
  const stateRef = useRef<TwoBodySimulationState>({
    sun: {
      id: 'sun',
      position: { x: 0, y: 0 },
      radius: 60,
      color: '#FDB813',
      mass: 1000,
      velocity: { x: 0, y: 0 },
      trail: []
    },
    planet: {
      id: 'planet',
      position: { x: 0, y: 0 },
      radius: 25,
      color: '#3498db',
      mass: 10,
      velocity: { x: 0, y: 0 },
      trail: []
    },
    isPaused: true,
    timeScale: 1,
    G: 1 
  });

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const calculateRadius = (mass: number, baseRadius: number) => {
    return baseRadius * Math.pow(mass / 1000, 1 / 3); // Ajuste o fator de escala conforme necessário
  };

  const updateSunMass = (newMass: number) => {
    const stateUpdate = { ...stateRef.current };
    stateUpdate.sun.mass = newMass;
    stateUpdate.sun.radius = calculateRadius(newMass, 60); // Atualizar o raio do Sol
    stateRef.current = stateUpdate;
  };
  
  const updatePlanetMass = (newMass: number) => {
    const stateUpdate = { ...stateRef.current };
    stateUpdate.planet.mass = newMass;
    stateUpdate.planet.radius = calculateRadius(newMass, 25); // Atualizar o raio do Planeta
    stateRef.current = stateUpdate;
  };
  
  const updateOrbitRadius = (newRadius: number) => {
    const stateUpdate = { ...stateRef.current };
    const centerX = containerRef.current ? containerRef.current.clientWidth / 2 : 0;
    const centerY = containerRef.current ? containerRef.current.clientHeight / 2 : 0;
  
    // Atualizar a posição do Planeta com base na nova distância orbital
    stateUpdate.planet.position = { x: centerX + newRadius, y: centerY };
    stateRef.current = stateUpdate;
  };
  
  const updateGravity = (newGravity: number) => {
    const stateUpdate = { ...stateRef.current };
    stateUpdate.G = newGravity;
    stateRef.current = stateUpdate;
  };

  const resetSimulation = (orbitRadius: number, sunMass: number, planetMass: number, gravity: number) => {
    const stateUpdate = { ...stateRef.current };
    const container = containerRef.current;
  
    if (!container) return;
  
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;
  
    // Atualizar o raio do Sol e do Planeta com base na massa
    stateUpdate.sun.radius = calculateRadius(sunMass, 60); // Raio base do Sol
    stateUpdate.planet.radius = calculateRadius(planetMass, 25); // Raio base do Planeta
  
    // Atualizar a massa do Sol e do Planeta
    stateUpdate.sun.mass = sunMass;
    stateUpdate.planet.mass = planetMass;
  
    // Posiciona o Sol no centro
    stateUpdate.sun.position = { x: centerX, y: centerY };
    stateUpdate.sun.velocity = { x: 0, y: 0 };
    stateUpdate.sun.trail = [];
  
    // Posiciona o Planeta em uma órbita inicial
    const orbitalVelocity = Math.sqrt((gravity * sunMass) / orbitRadius); // Velocidade orbital
  
    stateUpdate.planet.position = { x: centerX + orbitRadius, y: centerY };
    stateUpdate.planet.velocity = { x: 0, y: orbitalVelocity };
    stateUpdate.planet.trail = [];
    stateUpdate.isPaused = true;
    stateRef.current = stateUpdate;
  };

  const updateSimulation = (deltaTime: number) => {
    if (stateRef.current.isPaused) return;

    const state = { ...stateRef.current };
    const timeStep = deltaTime * state.timeScale;

    // Calcula a força gravitacional entre o Sol e o Planeta
    const dx = state.planet.position.x - state.sun.position.x;
    const dy = state.planet.position.y - state.sun.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; // Evita divisão por zero

    const forceMagnitude = (G * state.sun.mass * state.planet.mass) / (distance * distance);
    const force = {
      x: (-forceMagnitude * dx) / distance,
      y: (-forceMagnitude * dy) / distance
    };

    // Aplica a força ao Planeta (F = m * a => a = F / m)
    const acceleration = {
      x: force.x / state.planet.mass,
      y: force.y / state.planet.mass
    };

    // Atualiza a velocidade do Planeta
    state.planet.velocity.x += acceleration.x * timeStep;
    state.planet.velocity.y += acceleration.y * timeStep;

    // Atualiza a posição do Planeta
    state.planet.position.x += state.planet.velocity.x * timeStep;
    state.planet.position.y += state.planet.velocity.y * timeStep;

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
    resetSimulation(orbitRadius, sunMass, planetMass, gravity);
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
    getState: () => ({ ...stateRef.current }), // Retornar o estado atual
    resetSimulation,
    togglePause,
    setTimeScale,
    updateSunMass,
    updatePlanetMass,
    updateOrbitRadius,
    updateGravity
  };
}