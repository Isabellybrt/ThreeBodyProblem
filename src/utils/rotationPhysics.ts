import { useRef, useEffect } from 'react';

export interface RotatingBody {
  id: string;
  position: { x: number; y: number };
  angle: number;
  radius: number;
  color: string;
  rotationSpeed: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitCenter: { x: number; y: number };
  orbitAngle: number;
  displayTrail: boolean;
  trail: { x: number; y: number }[];
}

export interface RotationSimulationState {
  sun: RotatingBody;
  planet: RotatingBody;
  moon: RotatingBody;
  isPaused: boolean;
  timeScale: number;
}

export function useRotationPhysics(containerRef: React.RefObject<HTMLDivElement>) {
  const stateRef = useRef<RotationSimulationState>({
    sun: {
      id: 'sun',
      position: { x: 0, y: 0 },
      angle: 0,
      radius: 60,
      color: '#FDB813',
      rotationSpeed: 0.001,
      orbitRadius: 0,
      orbitSpeed: 0,
      orbitCenter: { x: 0, y: 0 },
      orbitAngle: 0,
      displayTrail: false,
      trail: []
    },
    planet: {
      id: 'planet',
      position: { x: 0, y: 0 },
      angle: 0,
      radius: 25,
      color: '#3498db',
      rotationSpeed: 0.01,
      orbitRadius: 200,
      orbitSpeed: 0.005,
      orbitCenter: { x: 0, y: 0 },
      orbitAngle: 0,
      displayTrail: true,
      trail: []
    },
    moon: {
      id: 'moon',
      position: { x: 0, y: 0 },
      angle: 0,
      radius: 8,
      color: '#bdc3c7',
      rotationSpeed: 0.02,
      orbitRadius: 60,
      orbitSpeed: 0.02,
      orbitCenter: { x: 0, y: 0 },
      orbitAngle: Math.PI / 4,
      displayTrail: true,
      trail: []
    },
    isPaused: true, 
    timeScale: 1
  });

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const MAX_TRAIL_POINTS = 200;

  const resetSimulation = () => {
    const stateUpdate = { ...stateRef.current };
    const container = containerRef.current;

    if (!container) return;

    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;

    stateUpdate.sun.position = { x: centerX, y: centerY };
    stateUpdate.sun.angle = 0;
    stateUpdate.sun.orbitCenter = { x: centerX, y: centerY };
    stateUpdate.sun.trail = [];

    stateUpdate.planet.orbitAngle = 0;
    stateUpdate.planet.angle = 0;
    stateUpdate.planet.orbitCenter = { x: centerX, y: centerY };
    stateUpdate.planet.position = {
      x: centerX + stateUpdate.planet.orbitRadius,
      y: centerY
    };
    stateUpdate.planet.trail = [stateUpdate.planet.position];

    stateUpdate.moon.orbitAngle = Math.PI / 4;
    stateUpdate.moon.angle = 0;
    stateUpdate.moon.position = {
      x: stateUpdate.planet.position.x + stateUpdate.moon.orbitRadius,
      y: stateUpdate.planet.position.y
    };
    stateUpdate.moon.trail = [stateUpdate.moon.position];

    stateRef.current = stateUpdate;
  };

  const updateSimulation = (deltaTime: number) => {
    if (stateRef.current.isPaused) return;

    const state = { ...stateRef.current };
    const timeStep = deltaTime * state.timeScale;

    state.sun.angle += state.sun.rotationSpeed * timeStep;

    state.planet.orbitAngle += state.planet.orbitSpeed * timeStep;
    state.planet.angle += state.planet.rotationSpeed * timeStep;
    state.planet.position = {
      x: state.sun.position.x + Math.cos(state.planet.orbitAngle) * state.planet.orbitRadius,
      y: state.sun.position.y + Math.sin(state.planet.orbitAngle) * state.planet.orbitRadius
    };

    state.moon.orbitAngle += state.moon.orbitSpeed * timeStep;
    state.moon.angle += state.moon.rotationSpeed * timeStep;
    state.moon.orbitCenter = state.planet.position;
    state.moon.position = {
      x: state.planet.position.x + Math.cos(state.moon.orbitAngle) * state.moon.orbitRadius,
      y: state.planet.position.y + Math.sin(state.moon.orbitAngle) * state.moon.orbitRadius
    };

    if (state.planet.displayTrail) {
      state.planet.trail.push({ ...state.planet.position });
      if (state.planet.trail.length > MAX_TRAIL_POINTS) {
        state.planet.trail.shift();
      }
    }

    if (state.moon.displayTrail) {
      state.moon.trail.push({ ...state.moon.position });
      if (state.moon.trail.length > MAX_TRAIL_POINTS) {
        state.moon.trail.shift();
      }
    }

    stateRef.current = state;
  };

  const animate = (time: number) => {
    console.log("Animating..."); // Verifique se isso é exibido no console
    const deltaTime = lastTimeRef.current ? (time - lastTimeRef.current) / 16.666 : 1;
    lastTimeRef.current = time;
  
    updateSimulation(deltaTime);
  
    if (!stateRef.current.isPaused) {
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    resetSimulation();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const togglePause = () => {
    stateRef.current.isPaused = !stateRef.current.isPaused;

    // Se a simulação for despausada, reinicie o loop de animação
    if (!stateRef.current.isPaused) {
      lastTimeRef.current = performance.now(); // Reinicie o tempo
      rafRef.current = requestAnimationFrame(animate);
    }

    return stateRef.current.isPaused;
  };

  const setTimeScale = (scale: number) => {
    stateRef.current.timeScale = scale;
  };

  const setRotationSpeed = (bodyId: string, speed: number) => {
    const state = { ...stateRef.current };

    if (bodyId === 'sun') {
      state.sun.rotationSpeed = speed;
    } else if (bodyId === 'planet') {
      state.planet.rotationSpeed = speed;
    } else if (bodyId === 'moon') {
      state.moon.rotationSpeed = speed;
    }

    stateRef.current = state;
  };

  const setOrbitSpeed = (bodyId: string, speed: number) => {
    const state = { ...stateRef.current };

    if (bodyId === 'planet') {
      state.planet.orbitSpeed = speed;
    } else if (bodyId === 'moon') {
      state.moon.orbitSpeed = speed;
    }

    stateRef.current = state;
  };

  return {
    getState: () => ({ ...stateRef.current }),
    resetSimulation,
    togglePause,
    setTimeScale,
    setRotationSpeed,
    setOrbitSpeed
  };
}