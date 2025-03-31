import { useEffect, useRef, useState, useCallback } from "react";
import { 
  initPhysicsSimulation, 
  startSimulation, 
  stopSimulation, 
  setupPhysicsEvents, 
  setupZoom, 
  cleanupSimulation,
  SimulationObjects,
  updateSimulationParameters,
  handleZoomIn,
  handleZoomOut,
  setupDragToMove,
  resetSimulation
} from "../utils/twoBodyPhysics";
import { Render } from "matter-js";

interface SimulationParams {
  sunMass: number;
  planetMass: number;
  initialVelocity: number;
  simulationSpeed?: number;
  orbitalDistance?: number;
}

export const useTwoBodySimulation = (params: SimulationParams = { 
  sunMass: 900, 
  planetMass: 1, 
  initialVelocity: 4,
  simulationSpeed: 1,
  orbitalDistance: 400
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<SimulationObjects | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(params.simulationSpeed || 1);
  const [currentZoom, setCurrentZoom] = useState(1);

  // Initialize simulation
  const initSimulation = useCallback(() => {
    if (!containerRef.current || simulationRef.current) return;
    
    try {
      simulationRef.current = initPhysicsSimulation(
        containerRef.current,
        params.sunMass,
        params.planetMass,
        params.initialVelocity,
        params.orbitalDistance,
        params.simulationSpeed 
      );
      
      setupPhysicsEvents(simulationRef.current);
      setupZoom(containerRef.current, simulationRef.current);
      setupDragToMove(containerRef.current, simulationRef.current);
      
      setIsInitialized(true);
      setIsPaused(true); // Inicia pausado mas com corpos visíveis
      setIsRunning(false);
      
      // Força uma atualização inicial
      Render.world(simulationRef.current.render);
        
    } catch (error) {
      console.error("Error initializing simulation:", error);
    }
  }, [params.sunMass, params.planetMass, params.initialVelocity, params.orbitalDistance, params.simulationSpeed ]);

  const updateParameters = useCallback((newParams: Partial<SimulationParams>) => {
    if (!simulationRef.current) return;
    
    if (newParams.simulationSpeed !== undefined) {
      setSimulationSpeed(newParams.simulationSpeed);
    }
    
    updateSimulationParameters(simulationRef.current, newParams);
  }, []);

  // Start simulation
  const start = useCallback(() => {
    if (!simulationRef.current) return;
    
    startSimulation(simulationRef.current);
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  // Stop simulation
  const stop = useCallback(() => {
    if (!simulationRef.current) return;
    
    stopSimulation(simulationRef.current);
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  // Reset simulation
  const reset = useCallback(() => {
    if (!simulationRef.current) return;
    
    // Usa a função resetSimulation do twoBodyPhysics
    resetSimulation(simulationRef.current);
    
    // Atualiza os estados
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  // Toggle pause/play
  const togglePause = useCallback(() => {
    if (isPaused) {
      start();
    } else {
      stop();
    }
  }, [isPaused, start, stop]);

  // Zoom in function
  const zoomIn = useCallback(() => {
    if (!simulationRef.current) return;
    handleZoomIn(simulationRef.current);
    setCurrentZoom(prev => prev + 0.2);
  }, []);

  // Zoom out function
  const zoomOut = useCallback(() => {
    if (!simulationRef.current) return;
    handleZoomOut(simulationRef.current);
    setCurrentZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        cleanupSimulation(simulationRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    isRunning,
    isInitialized,
    isPaused,
    currentZoom,
    initSimulation,
    start,
    stop,
    reset,
    toggle: togglePause,
    updateParameters,
    zoomIn,
    zoomOut
  };
};
