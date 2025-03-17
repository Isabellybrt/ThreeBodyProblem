
import { useRef, useEffect } from 'react';
import Matter from 'matter-js';

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
    isPaused: false,
    timeScale: 1
  });
  
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const MAX_TRAIL_POINTS = 200;

  // Reset the simulation
  const resetSimulation = () => {
    const stateUpdate = { ...stateRef.current };
    const container = containerRef.current;
    
    if (!container) return;
    
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;
    
    // Reset sun position to center
    stateUpdate.sun.position = { x: centerX, y: centerY };
    stateUpdate.sun.angle = 0;
    stateUpdate.sun.orbitCenter = { x: centerX, y: centerY };
    stateUpdate.sun.trail = [];
    
    // Reset planet position and orbit
    stateUpdate.planet.orbitAngle = 0;
    stateUpdate.planet.angle = 0;
    stateUpdate.planet.orbitCenter = { x: centerX, y: centerY };
    stateUpdate.planet.position = {
      x: centerX + stateUpdate.planet.orbitRadius,
      y: centerY
    };
    stateUpdate.planet.trail = [stateUpdate.planet.position];
    
    // Reset moon position and orbit
    stateUpdate.moon.orbitAngle = Math.PI / 4;
    stateUpdate.moon.angle = 0;
    stateUpdate.moon.position = {
      x: stateUpdate.planet.position.x + stateUpdate.moon.orbitRadius,
      y: stateUpdate.planet.position.y
    };
    stateUpdate.moon.trail = [stateUpdate.moon.position];
    
    stateRef.current = stateUpdate;
  };

  // Update the simulation
  const updateSimulation = (deltaTime: number) => {
    if (stateRef.current.isPaused) return;
    
    const state = { ...stateRef.current };
    const timeStep = deltaTime * state.timeScale;
    
    // Update sun rotation
    state.sun.angle += state.sun.rotationSpeed * timeStep;
    
    // Update planet position and rotation
    state.planet.orbitAngle += state.planet.orbitSpeed * timeStep;
    state.planet.angle += state.planet.rotationSpeed * timeStep;
    state.planet.position = {
      x: state.sun.position.x + Math.cos(state.planet.orbitAngle) * state.planet.orbitRadius,
      y: state.sun.position.y + Math.sin(state.planet.orbitAngle) * state.planet.orbitRadius
    };
    
    // Update moon position and rotation
    state.moon.orbitAngle += state.moon.orbitSpeed * timeStep;
    state.moon.angle += state.moon.rotationSpeed * timeStep;
    state.moon.orbitCenter = state.planet.position;
    state.moon.position = {
      x: state.planet.position.x + Math.cos(state.moon.orbitAngle) * state.moon.orbitRadius,
      y: state.planet.position.y + Math.sin(state.moon.orbitAngle) * state.moon.orbitRadius
    };
    
    // Update trails
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

  // Animation loop
  const animate = (time: number) => {
    const deltaTime = lastTimeRef.current ? (time - lastTimeRef.current) / 16.666 : 1;
    lastTimeRef.current = time;
    
    updateSimulation(deltaTime);
    rafRef.current = requestAnimationFrame(animate);
  };

  // Setup and cleanup
  useEffect(() => {
    resetSimulation();
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      resetSimulation();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Toggle pause
  const togglePause = () => {
    stateRef.current = {
      ...stateRef.current,
      isPaused: !stateRef.current.isPaused
    };
    return stateRef.current.isPaused;
  };

  // Set time scale
  const setTimeScale = (scale: number) => {
    stateRef.current = {
      ...stateRef.current,
      timeScale: scale
    };
  };

  // Set rotation speed
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

  // Set orbit speed
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
