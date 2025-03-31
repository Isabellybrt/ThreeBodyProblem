
import React, { useRef, useState, useEffect } from 'react';
import { useRotationSimulation } from '@/hooks/useRotationSimulation';
import RotationCanvas from '@/components/RotationCanvas';
import NavigationHeader from '@/components/NavigationHeader';
import SimulationGuide from '@/components/SimulationGuide';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut, Settings, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const RotationSimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [cameraOffset, setCameraOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startDragPosition, setStartDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  
  // Add missing state variables
  const [planetRotation, setPlanetRotation] = useState<number>(0.01);
  const [planetOrbit, setPlanetOrbit] = useState<number>(0.01);
  const [moonRotation, setMoonRotation] = useState<number>(0.01);
  const [moonOrbit, setMoonOrbit] = useState<number>(0.01);

  const [
    { sun, planet, moon, isPaused, dimensions, resetKey },
    { resetSimulation, handleTogglePause, handleSpeedChange, handleRotationSpeedChange, handleOrbitSpeedChange }
  ] = useRotationSimulation(containerRef);

  const [speed, setSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(false);

  useEffect(() => {
    if (isMobile) {
      setZoomLevel(0.5);
      // Reset camera offset to center view on mobile (changed from -180 back to 0 as requested)
      setCameraOffset({ x: 0, y: 0 });
      
      // Allow scrolling now that we've removed overflow-y-hidden
    }
  }, [isMobile]);

  const handleSpeedChangeLocal = (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);
    handleSpeedChange(newSpeed);
  };

  const handlePlanetRotationChange = (value: number[]) => {
    const newValue = value[0];
    setPlanetRotation(newValue);
    handleRotationSpeedChange('planet', newValue);
  };

  const handlePlanetOrbitChange = (value: number[]) => {
    const newValue = value[0];
    setPlanetOrbit(newValue);
    handleOrbitSpeedChange('planet', newValue);
  };

  const handleMoonRotationChange = (value: number[]) => {
    const newValue = value[0];
    setMoonRotation(newValue);
    handleRotationSpeedChange('moon', newValue);
  };

  const handleMoonOrbitChange = (value: number[]) => {
    const newValue = value[0];
    setMoonOrbit(newValue);
    handleOrbitSpeedChange('moon', newValue);
  };

  const toggleShowControls = () => {
    if (isMobile && isGuideOpen) {
      setIsGuideOpen(false);
    }
    setShowControls(!showControls);
  };

  const guideContent = (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Translação e Rotação de Corpos Celestes</h3>
      <p>
        Esta simulação demonstra os movimentos fundamentais dos corpos celestes: 
        <strong> translação</strong> (movimento orbital) e <strong>rotação</strong> 
        (giro em torno do próprio eixo).
      </p>
      
      <div className="space-y-3">
        <h4 className="font-bold">Translação (Movimento Orbital)</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Movimento de um corpo ao redor de outro devido à força gravitacional</li>
          <li>Órbitas geralmente são elípticas, como descrito pelas Leis de Kepler</li>
          <li>Período orbital: tempo para completar uma volta ao redor do corpo central</li>
          <li>Exemplo: A Terra leva ~365 dias para orbitar o Sol (translação)</li>
        </ul>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-bold">Rotação (Movimento Axial)</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Giro de um corpo celeste em torno do seu próprio eixo</li>
          <li>Determina a duração do dia no corpo celeste</li>
          <li>Pode causar achatamento nos polos devido à força centrífuga</li>
          <li>Exemplo: A Terra completa uma rotação em ~24 horas</li>
        </ul>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-bold">Características Observáveis</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>A <span className="text-white">linha branca</span> indica a rotação do corpo</li>
          <li>Corpos podem ter rotação sincronizada (ex: Lua mostra sempre a mesma face para a Terra)</li>
          <li>Velocidades de rotação e translação são independentes</li>
          <li>Trajetórias mostram o caminho orbital dos corpos</li>
        </ul>
      </div>
      
      <div className="p-3 bg-gray-800 rounded-md">
        <h4 className="font-bold text-sm mb-1">Exemplos no Sistema Solar</h4>
        <ul className="text-xs space-y-1">
          <li><strong>Mercúrio:</strong> Rotações lentas (58 dias terrestres) e translação rápida (88 dias)</li>
          <li><strong>Vênus:</strong> Rotação retrógrada (sentido horário) e extremamente lenta (243 dias)</li>
          <li><strong>Júpiter:</strong> Rotação rápida (10 horas) devido à sua composição gasosa</li>
          <li><strong>Lua:</strong> Rotação sincronizada com sua translação ao redor da Terra</li>
        </ul>
      </div>
    </div>
  );

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragPosition({ x: event.clientX, y: event.clientY });
  };
  
  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = event.clientX - startDragPosition.x;
      const deltaY = event.clientY - startDragPosition.y;
  
      setCameraOffset((prevOffset) => ({
        x: prevOffset.x + deltaX,
        y: prevOffset.y + deltaY,
      }));
  
      setStartDragPosition({ x: event.clientX, y: event.clientY });
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

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.4));
  };

  useEffect(() => {
    if (!isMobile || !containerRef.current) return;
    
    let lastDistance = 0;
    let isTouchDragging = false;
    let lastTouchX = 0;
    let lastTouchY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouchDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isTouchDragging) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        
        setCameraOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (lastDistance > 0) {
          const delta = distance - lastDistance;
          if (Math.abs(delta) > 1) {
            const zoomChange = delta * 0.01;
            setZoomLevel(prev => Math.max(0.1, Math.min(prev + zoomChange, 5)));
          }
        }
        
        lastDistance = distance;
      }
    };
    
    const handleTouchEnd = () => {
      isTouchDragging = false;
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
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      className="simulation-container w-full min-h-screen relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <RotationCanvas
        sun={sun}
        planet={planet}
        moon={moon}
        width={dimensions.width}
        height={dimensions.height}
        zoomLevel={zoomLevel}
        cameraOffset={cameraOffset}
      />
      
      <NavigationHeader title="Simulação de Translação e Rotação" />
      
      <SimulationGuide 
        title="Guia: Translação e Rotação"
        content={guideContent}
        isParametersOpen={showControls}
        setIsParametersOpen={setShowControls}
      />
      
      {/* Zoom controls - Right side - Fixed position */}
      <div className="fixed top-24 right-4 flex flex-col gap-2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoomIn}
          className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleZoomOut}
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
            onClick={resetSimulation}
            className="bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleTogglePause}
            className="bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
      )}
      
      {/* Show controls button for mobile */}
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
      
      {/* Always show controls for desktop, conditionally for mobile */}
      {(showControls || !isMobile) && (
        <div 
          className={`control-panel ${
            isMobile 
              ? 'fixed inset-x-0 bottom-0 rounded-t-lg max-h-[60vh] overflow-auto z-30' 
              : 'fixed right-4 bottom-4 rounded-lg w-80 z-30'
          } p-4 transition-all duration-300 ease-in-out bg-black/80 backdrop-blur-md`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">Translação e Rotação</h3>
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
            Ajuste as velocidades de rotação e translação dos corpos celestes.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm text-gray-300 flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-[#3498db]"></div>
                Planeta
              </h4>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Rotação</label>
                  <span className="text-xs text-gray-400">{planetRotation.toFixed(3)}</span>
                </div>
                <Slider
                  min={0}
                  max={0.05}
                  step={0.001}
                  value={[planetRotation]}
                  onValueChange={handlePlanetRotationChange}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Órbita</label>
                  <span className="text-xs text-gray-400">{planetOrbit.toFixed(3)}</span>
                </div>
                <Slider
                  min={0}
                  max={0.05}
                  step={0.001}
                  value={[planetOrbit]}
                  onValueChange={handlePlanetOrbitChange}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm text-gray-300 flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-[#bdc3c7]"></div>
                Lua
              </h4>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Rotação</label>
                  <span className="text-xs text-gray-400">{moonRotation.toFixed(3)}</span>
                </div>
                <Slider
                  min={0}
                  max={0.05}
                  step={0.001}
                  value={[moonRotation]}
                  onValueChange={handleMoonRotationChange}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Órbita</label>
                  <span className="text-xs text-gray-400">{moonOrbit.toFixed(3)}</span>
                </div>
                <Slider
                  min={0}
                  max={0.05}
                  step={0.001}
                  value={[moonOrbit]}
                  onValueChange={handleMoonOrbitChange}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Velocidade</label>
                <span className="text-xs text-gray-400">{speed.toFixed(1)}x</span>
              </div>
              <Slider
                min={0.1}
                max={2}
                step={0.1}
                value={[speed]}
                onValueChange={handleSpeedChangeLocal}
              />
            </div>
            
            <div className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetSimulation}
                className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTogglePause}
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
              A linha branca em cada corpo indica sua rotação em torno do próprio eixo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RotationSimulation;
