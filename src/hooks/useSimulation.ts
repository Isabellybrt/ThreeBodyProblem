
import { useState, useRef, useEffect } from 'react';
import { ThreeBodyPhysics, Body } from '@/utils/physicsEngine';

export interface SimulationState {
  bodies: Body[];
  isPaused: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  resetKey: number; // Add resetKey to trigger canvas clearing
}

export interface SimulationActions {
  resetSimulation: () => void;
  randomizeSimulation: () => void;
  handleTogglePause: () => void;
  handleSpeedChange: (speed: number) => void;
  handleMassChange: (id: number, mass: number) => void;
  handleResize: () => void;
}

export function useSimulation(containerRef: React.RefObject<HTMLDivElement>): [SimulationState, SimulationActions] {
  const physicsRef = useRef<ThreeBodyPhysics | null>(null);
  const animationRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [bodies, setBodies] = useState<Body[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0); // Add resetKey state
  
  // Initialize the physics engine
  const initPhysics = () => {
    const width = dimensions.width;
    const height = dimensions.height;
    
    // If we already have a physics engine, destroy it first to clean up
    if (physicsRef.current) {
      physicsRef.current.destroy();
    }
    
    physicsRef.current = new ThreeBodyPhysics({
      width,
      height,
    });
    
    // Initial body configuration
    if (bodies.length === 0) {
      // Only set default values if bodies don't exist yet
      resetSimulation();
    } else {
      // If we already have bodies with user-defined masses, use those
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

  // Reset simulation to initial state with triangle formation
  const resetSimulation = () => {
    // Increment resetKey to force canvas clearing first
    setResetKey(prev => prev + 1);
    
    // Make sure the physics engine exists
    if (!physicsRef.current) {
      const width = dimensions.width;
      const height = dimensions.height;
      
      physicsRef.current = new ThreeBodyPhysics({
        width,
        height,
      });
    } else {
      // Destroy the old physics engine completely
      physicsRef.current.destroy();
      
      // Recreate physics engine
      const width = dimensions.width;
      const height = dimensions.height;
      
      physicsRef.current = new ThreeBodyPhysics({
        width,
        height,
      });
    }
    
    // First pause the simulation if not already paused
    setIsPaused(true);
    
    const width = dimensions.width;
    const height = dimensions.height;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create a triangle formation
    const radius = Math.min(width, height) * 0.15; // Radius for the triangle
    
    // Calculate positions for triangle vertices
    const angle1 = 0; // First body at 0 degrees (right)
    const angle2 = 2 * Math.PI / 3; // Second body at 120 degrees
    const angle3 = 4 * Math.PI / 3; // Third body at 240 degrees
    
    const pos1 = {
      x: centerX + radius * Math.cos(angle1),
      y: centerY + radius * Math.sin(angle1)
    };
    
    const pos2 = {
      x: centerX + radius * Math.cos(angle2),
      y: centerY + radius * Math.sin(angle2)
    };
    
    const pos3 = {
      x: centerX + radius * Math.cos(angle3),
      y: centerY + radius * Math.sin(angle3)
    };
    
    // Fixed default masses
    const mass1 = 50;
    const mass2 = 70;
    const mass3 = 35;
    
    // Define colors
    const color1 = '#ff4d5a';
    const color2 = '#42c3f7';
    const color3 = '#fdca40';
    
    const trailColor1 = 'rgba(255, 77, 90, 0.5)'; // Vermelho mais vivo
    const trailColor2 = 'rgba(66, 195, 247, 0.5)'; // Azul mais vivo
    const trailColor3 = 'rgba(253, 202, 64, 0.5)'; // Amarelo mais vivo
    
    // Create new bodies
    const newBodies = physicsRef.current.initBodies([
      {
        mass: mass1,
        x: pos1.x,
        y: pos1.y,
        velocityX: 0,
        velocityY: 0,
        color: color1,
        trailColor: trailColor1
      },
      {
        mass: mass2,
        x: pos2.x,
        y: pos2.y,
        velocityX: 0,
        velocityY: 0,
        color: color2,
        trailColor: trailColor2
      },
      {
        mass: mass3,
        x: pos3.x,
        y: pos3.y,
        velocityX: 0,
        velocityY: 0,
        color: color3,
        trailColor: trailColor3
      }
    ]);
    
    // Update UI state
    setBodies([...newBodies]);
  };

  // Create a randomized configuration
  const randomizeSimulation = () => {
    // Increment resetKey to force canvas clearing first
    setResetKey(prev => prev + 1);
    
    // Make sure the physics engine exists
    if (!physicsRef.current) {
      const width = dimensions.width;
      const height = dimensions.height;
      
      physicsRef.current = new ThreeBodyPhysics({
        width,
        height,
      });
    } else {
      // Destroy the old physics engine completely
      physicsRef.current.destroy();
      
      // Recreate physics engine
      const width = dimensions.width;
      const height = dimensions.height;
      
      physicsRef.current = new ThreeBodyPhysics({
        width,
        height,
      });
    }

    setIsPaused(true);

    const width = dimensions.width;
    const height = dimensions.height;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    
    // Function to get a random position within a circle
    const getRandomPosition = () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius * 0.7;
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance
      };
    };
    
    // Function to get random velocity
    const getRandomVelocity = (factor: number = 1) => {
      return (Math.random() - 0.5) * factor * 3;
    };
    
    // Create positions
    const pos1 = getRandomPosition();
    const pos2 = getRandomPosition();
    const pos3 = getRandomPosition();
    
    // Create bodies with randomized parameters
    const newBodies = physicsRef.current.initBodies([
      {
        mass: 30 + Math.random() * 70,
        x: pos1.x,
        y: pos1.y,
        velocityX: getRandomVelocity(),
        velocityY: getRandomVelocity(),
        color: '#ff4d5a',
        trailColor: 'rgba(255, 77, 90, 0.2)'
      },
      {
        mass: 30 + Math.random() * 70,
        x: pos2.x,
        y: pos2.y,
        velocityX: getRandomVelocity(),
        velocityY: getRandomVelocity(),
        color: '#42c3f7',
        trailColor: 'rgba(66, 195, 247, 0.2)'
      },
      {
        mass: 30 + Math.random() * 70,
        x: pos3.x,
        y: pos3.y,
        velocityX: getRandomVelocity(),
        velocityY: getRandomVelocity(),
        color: '#fdca40',
        trailColor: 'rgba(253, 202, 64, 0.2)'
      }
    ]);
    
    setBodies([...newBodies]);
  };

  // Handle resize event
  const handleResize = () => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      setDimensions({ width, height });
      
      // Reinitialize physics with new dimensions
      if (physicsRef.current) {
        initPhysics();
      }
    }
  };

  // Handle simulation controls
  const handleTogglePause = () => {
    if (physicsRef.current) {
      // Update the pause state without reinitializing the physics
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
    
    // Update the mass in the physics engine
    physicsRef.current.setMass(id - 1, mass);
    
    // Update our UI state with the new masses
    const updatedBodies = physicsRef.current.getBodies();
    setBodies([...updatedBodies]);
  };

  // Setup the simulation
  useEffect(() => {
    handleResize();
    
    // Initialize physics engine
    initPhysics();
    
    // Set up animation loop
    const animate = () => {
      if (!isPaused && physicsRef.current) {
        // Update physics
        physicsRef.current.update();
        
        // Get updated bodies
        const updatedBodies = physicsRef.current.getBodies();
        setBodies([...updatedBodies]);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);
    
    // Clean up on unmount
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
    { resetSimulation, randomizeSimulation, handleTogglePause, handleSpeedChange, handleMassChange, handleResize }
  ];
}
