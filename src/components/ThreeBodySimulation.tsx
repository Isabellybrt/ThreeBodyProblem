
import React, { useRef, useState, useEffect } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import SimulationCanvas from './SimulationCanvas';
import SimulationControls from './SimulationControls';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Play, Pause, RotateCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ThreeBodySimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [cameraOffset, setCameraOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startDragPosition, setStartDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  
  const [
    { bodies, isPaused, dimensions, resetKey },
    { resetSimulation, randomizeSimulation, handleTogglePause, handleSpeedChange, handleMassChange }
  ] = useSimulation(containerRef);

  // Adjust zoom level based on device
  useEffect(() => {
    if (isMobile) {
      setZoomLevel(0.7);
      // Reset camera offset to center view (changed from -50 back to 0 as requested)
      setCameraOffset({ x: 0, y: 0 });
    }
  }, [isMobile]);

  // Add touch events for mobile panning and zooming
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
        // For pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isTouchDragging) {
        // Pan the camera
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        
        setCameraOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Handle pinch zoom
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

  // Fix for requiring two clicks to start simulation
  const handlePauseToggle = () => {
    handleTogglePause();
  };

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
      <SimulationCanvas
        bodies={bodies}
        width={dimensions.width}
        height={dimensions.height}
        resetKey={resetKey}
        zoomLevel={zoomLevel}
        cameraOffset={cameraOffset}
      />
      
      {/* Zoom controls - Right side - Fixed */}
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
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePauseToggle} 
            className="bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        </div>
      )}
      
      <SimulationControls
        onReset={resetSimulation}
        onRandomize={randomizeSimulation}
        onTogglePause={handlePauseToggle}
        onSpeedChange={handleSpeedChange}
        onMassChange={handleMassChange}
        isPaused={isPaused}
        bodies={bodies}
        showInitially={!isMobile} 
        isGuideOpen={isGuideOpen}
        setIsGuideOpen={setIsGuideOpen}
        setShowControls={setShowControls}
        showControls={showControls}
      />
    </div>
  );
};

export default ThreeBodySimulation;
