import React, { useRef, useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import SimulationCanvas from './SimulationCanvas';
import SimulationControls from './SimulationControls';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

const ThreeBodySimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [cameraOffset, setCameraOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startDragPosition, setStartDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const [
    { bodies, isPaused, dimensions, resetKey },
    { resetSimulation, randomizeSimulation, handleTogglePause, handleSpeedChange, handleMassChange }
  ] = useSimulation(containerRef);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.4));
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragPosition({ x: event.clientX, y: event.clientY });
  };
  
  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = event.clientX - startDragPosition.x;
      const deltaY = event.clientY - startDragPosition.y;
  
      // Atualize o offset da câmera com base no movimento do mouse
      setCameraOffset((prevOffset) => ({
        x: prevOffset.x + deltaX,
        y: prevOffset.y + deltaY,
      }));
  
      // Atualize a posição inicial para o próximo movimento
      setStartDragPosition({ x: event.clientX, y: event.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault(); // Evita o comportamento padrão de scroll
  
    const zoomSpeed = 0.1; // Velocidade do zoom
    const delta = event.deltaY; // Direção do scroll (positivo para baixo, negativo para cima)
  
    // Ajustar o zoomLevel com base na direção do scroll
    setZoomLevel((prevZoomLevel) => {
      let newZoomLevel = prevZoomLevel;
  
      if (delta < 0) {
        // Scroll para cima (zoom in)
        newZoomLevel *= 1 + zoomSpeed;
      } else {
        // Scroll para baixo (zoom out)
        newZoomLevel *= 1 - zoomSpeed;
      }
  
      // Limitar o zoom mínimo e máximo
      newZoomLevel = Math.max(0.1, Math.min(newZoomLevel, 5)); // Exemplo: zoom entre 0.1x e 5x
  
      return newZoomLevel;
    });
  };

  return (
    <div
    ref={containerRef}
    className="simulation-container w-full h-screen relative overflow-hidden"
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp} 
    onWheel={handleWheel}
  >
    <SimulationCanvas
      bodies={bodies}
      width={dimensions.width}
      height={dimensions.height}
      resetKey={resetKey}
      zoomLevel={zoomLevel}
      cameraOffset={cameraOffset} // Passe o offset da câmera como prop
    />
    
    {/* Zoom controls */}
    <div className="absolute top-24 right-4 flex flex-col gap-2 z-10">
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
    
    <SimulationControls
      onReset={resetSimulation}
      onRandomize={randomizeSimulation}
      onTogglePause={handleTogglePause}
      onSpeedChange={handleSpeedChange}
      onMassChange={handleMassChange}
      isPaused={isPaused}
      bodies={bodies}
    />
  </div>
  );
};

export default ThreeBodySimulation;
