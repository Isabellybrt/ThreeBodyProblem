
import React, { useRef, useState, useEffect } from "react";
import { useTwoBodySimulation } from '@/hooks/useTwoBodySimulation';
import NavigationHeader from '@/components/NavigationHeader';
import SimulationGuide from "@/components/SimulationGuide";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut, Settings, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { G } from '@/utils/twoBodyPhysics';

const TwoBodySimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0.8);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [cameraOffset, setCameraOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startDragPosition, setStartDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();

  const [sunMass, setSunMass] = useState(900);
  const [planetMass, setPlanetMass] = useState(1);
  const [initialVelocity, setInitialVelocity] = useState(4);
  const [simSpeed, setSimSpeed] = useState(1);
  const [orbitalDistance, setOrbitalDistance] = useState(400);

  // Calculate the gravitational force for display
  const calculateForce = () => {
    const distance = orbitalDistance;
    const force = (G * sunMass * planetMass) / (distance * distance);
    return force;
  };
  
  // Format the force for display
  const formattedForce = calculateForce().toExponential(2);

  // Detect mobile devices and adjust zoom
  useEffect(() => {
    if (isMobile) {
      setZoomLevel(0.5);
      // Position more center/right as requested
      setCameraOffset({ x: -50, y: 0 });
    }
  }, [isMobile]);

  const {
    containerRef: simulationContainerRef,
    isRunning,
    isInitialized,
    isPaused,
    initSimulation,
    start,
    stop,
    reset,
    toggle,
    updateParameters,
    zoomIn,
    zoomOut,
  } = useTwoBodySimulation({
    sunMass,
    planetMass,
    initialVelocity,
    simulationSpeed: simSpeed,
    orbitalDistance
  });

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  useEffect(() => {
    if (isInitialized) {
      updateParameters({ 
        sunMass, 
        planetMass, 
        initialVelocity, 
        simulationSpeed: simSpeed,
        orbitalDistance
      });
    }
  }, [sunMass, planetMass, initialVelocity, simSpeed, orbitalDistance, isInitialized, updateParameters]);

  // Handle touch events for mobile panning and zooming
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;
    
    let lastDistance = 0;
    let isDragging = false;
    let lastTouchX = 0;
    let lastTouchY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        
        setCameraOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        
        if (simulationContainerRef.current) {
          const dragEvent = new CustomEvent('canvas-drag', {
            detail: { dx, dy, isPaused }
          });
          simulationContainerRef.current.dispatchEvent(dragEvent);
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (lastDistance > 0) {
          const delta = distance - lastDistance;
          if (Math.abs(delta) > 1) {
            const zoomChange = delta * 0.01;
            setZoomLevel(prev => Math.max(0.1, Math.min(prev + zoomChange, 5)));
            
            // Apply zoom to the simulation
            if (delta > 0) {
              zoomIn();
            } else {
              zoomOut();
            }
          }
        }
        
        lastDistance = distance;
      }
    };
    
    const handleTouchEnd = () => {
      isDragging = false;
      lastDistance = 0;
    };
    
    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: true }); // Changed to passive: true to allow scrolling
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, simulationContainerRef, isPaused, zoomIn, zoomOut]);

  const handleSpeedChange = (values: number[]) => {
    const newSpeed = values[0];
    setSimSpeed(newSpeed);
    updateParameters({ simulationSpeed: newSpeed });
  };

  const toggleShowControls = () => {
    if (isMobile && isGuideOpen) {
      setIsGuideOpen(false);
    }
    setShowControls(!showControls);
  };

  const guideContent = (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Lei da Gravitação Universal</h3>
      <p>
        A força gravitacional entre dois corpos é diretamente proporcional ao produto de suas massas
        e inversamente proporcional ao quadrado da distância entre eles.
      </p>
      
      <div className="bg-black/30 p-3 rounded-lg">
        <div className="text-center font-mono text-lg mb-2">
          F = G × (m₁ × m₂) / r²
        </div>
      </div>
    
      <div className="space-y-3">
        <h4 className="font-bold">Características Principais:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>A força gravitacional sempre atrai os corpos</li>
          <li>A atração é proporcional às massas dos corpos</li>
          <li>A força diminui com o quadrado da distância</li>
          <li>Mudanças na velocidade inicial afetam a órbita (elíptica, circular, parabólica)</li>
        </ul>
      </div>
    
      <div className="p-3 bg-gray-800 rounded-md">
        <p className="text-xs italic">
          A lei da gravitação universal foi proposta por Isaac Newton em 1687 e explica
          como os planetas orbitam em torno do Sol e o comportamento da maioria dos sistemas 
          planetários.
        </p>
      </div>
    </div>
  );

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragPosition({ x: event.clientX, y: event.clientY });
  };
  
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - startDragPosition.x;
    const deltaY = event.clientY - startDragPosition.y;
    
    setCameraOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setStartDragPosition({ x: event.clientX, y: event.clientY });
    
    if (simulationContainerRef.current) {
      const moveEvent = new CustomEvent('canvas-drag', {
        detail: { dx: deltaX, dy: deltaY, isPaused }
      });
      simulationContainerRef.current.dispatchEvent(moveEvent);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const delta = event.deltaY;
  
    setZoomLevel((prevZoomLevel) => {
      let newZoomLevel = prevZoomLevel;
  
      if (delta < 0) {
        newZoomLevel *= 1 + zoomSpeed;
      } else {
        newZoomLevel *= 1 - zoomSpeed;
      }
  
      newZoomLevel = Math.max(0.1, Math.min(newZoomLevel, 5));
      return newZoomLevel;
    });
  };

  return (
    <div
      ref={containerRef}
      className="simulation-container w-full min-h-screen relative bg-black"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div 
        ref={simulationContainerRef}
        className="absolute inset-0 w-full h-full"
      />
      
      <NavigationHeader title="Simulação Gravitacional de Dois Corpos" />
      
      <SimulationGuide 
        title="Guia: Lei da Gravitação Universal"
        content={guideContent}
        isParametersOpen={showControls}
        setIsParametersOpen={setShowControls}
      />
      
      {/* Zoom controls - Right side - Fixed */}
      <div className="fixed top-24 right-4 flex flex-col gap-2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={zoomIn}
          className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={zoomOut}
          className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Play/Reset buttons - Left side - Fixed for mobile only */}
      {isMobile && (
        <div className="fixed top-24 left-4 flex flex-col gap-2 z-10">
          <Button 
            variant="outline" 
            size="icon"
            onClick={reset}
            className="bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggle}
            className="bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
      )}
      
      {/* Mobile parameters button */}
      {isMobile && !showControls && (
        <div 
          className="fixed bottom-4 right-4 z-20 flex transition-all duration-300"
          onClick={toggleShowControls}
        >
          <Button 
            className="flex items-center gap-2 text-white/80 bg-black/80 backdrop-blur-sm hover:bg-black/80"
          >
            <Settings size={18} />
            <span>Parâmetros</span>
            <ChevronUp size={18} />
          </Button>
        </div>
      )}
      
      {/* Controls panel */}
      {(showControls || !isMobile) && (
        <div 
          className={`control-panel ${
            isMobile 
              ? 'fixed inset-x-0 bottom-0 rounded-t-lg max-h-[60vh] overflow-auto z-30' 
              : 'fixed right-4 bottom-4 rounded-lg w-80 z-30'
          } p-4 transition-all duration-300 ease-in-out bg-black/80 backdrop-blur-md`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">Simulação de Dois Corpos</h3>
            {isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-300 hover:text-white p-1"
                onClick={toggleShowControls}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-300 mb-4">
            Ajuste os parâmetros da simulação
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-white/70 text-sm">
                <label className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-yellow-400"></div>
                  Massa do Sol
                </label>
                <span>{sunMass}</span>
              </div>
              <Slider 
                value={[sunMass]} 
                min={100}
                max={2000}
                step={10}
                onValueChange={(values) => setSunMass(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-white/70 text-sm">
                <label className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-blue-400"></div>
                  Massa do Planeta
                </label>
                <span>{planetMass}</span>
              </div>
              <Slider 
                value={[planetMass]} 
                min={1}
                max={100}
                step={1}
                onValueChange={(values) => setPlanetMass(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-white/70 text-sm">
                <label>Velocidade Inicial</label>
                <span>{initialVelocity}</span>
              </div>
              <Slider 
                value={[initialVelocity]} 
                min={1}
                max={10}
                step={0.1}
                onValueChange={(values) => setInitialVelocity(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-white/70 text-sm">
                <label>Distância Orbital</label>
                <span>{orbitalDistance}</span>
              </div>
              <Slider 
                value={[orbitalDistance]} 
                min={200}
                max={800}
                step={10}
                onValueChange={(values) => setOrbitalDistance(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-white/70 text-sm">
                <label>Velocidade da Simulação</label>
                <span>{simSpeed.toFixed(1)}x</span>
              </div>
              <Slider 
                value={[simSpeed]} 
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={handleSpeedChange}
              />
            </div>
            
            <div className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={reset}
                className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggle}
                className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 flex items-center justify-center"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Iniciar
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pausar
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-400 italic">
              Constante Gravitacional (G) fixa em 6.67408 × 10⁻¹¹ N.m²/kg²
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoBodySimulation;
