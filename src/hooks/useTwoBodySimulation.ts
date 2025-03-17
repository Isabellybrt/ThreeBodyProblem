
import { useState, useRef, useEffect } from 'react';
import { TwoBodyPhysics, Body } from '@/utils/twoBodyPhysics';

export interface SimulationState {
  bodies: Body[];
  isPaused: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  resetKey: number;
}

export interface SimulationActions {
  resetSimulation: () => void;
  handleTogglePause: () => void;
  handleSpeedChange: (speed: number) => void;
  handleMassChange: (id: number, mass: number) => void;
}

export function useTwoBodySimulation(containerRef: React.RefObject<HTMLDivElement>): [SimulationState, SimulationActions] {
  const physicsRef = useRef<TwoBodyPhysics | null>(null);
  const animationRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [bodies, setBodies] = useState<Body[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);
  
  // Initialize the physics engine
  const initPhysics = () => {
    const width = dimensions.width;
    const height = dimensions.height;
    
    if (physicsRef.current) {
      physicsRef.current.destroy();
    }
    
    physicsRef.current = new TwoBodyPhysics({
      width,
      height,
    });
    
    if (bodies.length === 0) {
      resetSimulation();
    } else {
      const currentBodies = bodies.map(body => ({
        mass: body.mass,
        x: body.body ? body.body.position.x : width / 2,
        y: body.body ? body.body.position.y : height / 2,
        velocityX: body.body ? body.body.velocity.x : 0,
        velocityY: body.body ? body.body.velocity.y : 0,
        color: body.color,
        trailColor: body.trailColor
      }));
      
      const newBodies = physicsRef.current.initBodies(currentBodies);
      setBodies([...newBodies]);
    }
  };

  // Reset simulation to initial state
  const resetSimulation = () => {
    setResetKey(prev => prev + 1);
    
    if (!physicsRef.current) {
      const width = dimensions.width;
      const height = dimensions.height;
      
      physicsRef.current = new TwoBodyPhysics({
        width,
        height,
      });
    } else {
      physicsRef.current.destroy();
      
      const width = dimensions.width;
      const height = dimensions.height;
      
      physicsRef.current = new TwoBodyPhysics({
        width,
        height,
      });
    }
    
    setIsPaused(true);
    
    const width = dimensions.width;
    const height = dimensions.height;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Central body (star/sun)
    const centralMass = 300;
    const centralColor = '#FDB813'; // Golden/yellow for the sun
    const centralTrailColor = 'rgba(253, 184, 19, 0.1)';
    
    // Orbiting body (planet)
    const orbitingMass = 30;
    const orbitingColor = '#3498db'; // Blue for the planet
    const orbitingTrailColor = 'rgba(52, 152, 219, 0.3)';
    
    // Distance between bodies
    const distance = Math.min(width, height) * 0.2;
    
    // Calculate orbital velocity based on central body mass
    const orbitalVelocity = Math.sqrt((G * centralMass) / distance) * 0.6;
    
    // Create new bodies
    const newBodies = physicsRef.current.initBodies([
      {
        mass: centralMass,
        x: centerX,
        y: centerY,
        velocityX: 0,
        velocityY: 0,
        color: centralColor,
        trailColor: centralTrailColor
      },
      {
        mass: orbitingMass,
        x: centerX + distance,
        y: centerY,
        velocityX: 0,
        velocityY: orbitalVelocity,
        color: orbitingColor,
        trailColor: orbitingTrailColor
      }
    ]);
    
    setBodies([...newBodies]);
  };

  // Handle simulation controls
  const handleTogglePause = () => {
    if (physicsRef.current) {
      const paused = physicsRef.current.togglePause();
      setIsPaused(paused);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (physicsRef.current) {
      physicsRef.current.setTimeScale(speed);
    }
  };

  const handleMassChange = (id: number, mass: number) => {
    if (!physicsRef.current) return;
    
    physicsRef.current.setMass(id - 1, mass);
    
    const updatedBodies = physicsRef.current.getBodies();
    setBodies([...updatedBodies]);
  };

  // Handle resize
  const handleResize = () => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      setDimensions({ width, height });
      
      if (physicsRef.current) {
        initPhysics();
      }
    }
  };

  // Setup the simulation
  useEffect(() => {
    handleResize();
    initPhysics();
    
    const animate = () => {
      if (!isPaused && physicsRef.current) {
        physicsRef.current.update();
        
        const updatedBodies = physicsRef.current.getBodies();
        setBodies([...updatedBodies]);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (physicsRef.current) {
        physicsRef.current.destroy();
      }
    };
  }, [isPaused]);

  // Add resize listener
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return [
    { bodies, isPaused, dimensions, resetKey },
    { resetSimulation, handleTogglePause, handleSpeedChange, handleMassChange }
  ];
}

// Gravitational constant - same as in TwoBodyPhysics
const G: number = 0.3;
