import React, { useRef, useState } from 'react';
import { useTwoBodySimulation } from '@/hooks/useTwoBodySimulation';
import TwoBodyCanvas from '@/components/TwoBodyCanvas';
import NavigationHeader from '@/components/NavigationHeader';
import SimulationGuide from '@/components/SimulationGuide';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';


const TwoBodySimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [cameraOffset, setCameraOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startDragPosition, setStartDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [speed, setSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [sunMass, setSunMass] = useState<number>(1000);
  const [planetMass, setPlanetMass] = useState<number>(10);
  const [orbitRadius, setOrbitRadius] = useState<number>(200);
  const [gravity, setGravity] = useState<number>(1);

  const [
    { sun, planet, isPaused, dimensions, resetKey },
    { resetSimulation, handleTogglePause, handleSpeedChange }
  ] = useTwoBodySimulation(containerRef, orbitRadius, sunMass, planetMass, gravity);


  const handleSpeedChangeLocal = (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);
    handleSpeedChange(newSpeed);
  };

  const calculateGravitationalForce = () => {
    const distance = orbitRadius;
    if (distance === 0) return 0;
    return (gravity * sunMass * planetMass) / (distance * distance);
  };

  const calculateCentripetalForce = () => {
    const velocity = Math.sqrt((gravity * sunMass) / orbitRadius);
    return (planetMass * velocity * velocity) / orbitRadius;
  };

  const guideContent = (
    <div className="space-y-4">
      <p>
        Esta simulação demonstra o movimento orbital de dois corpos, com base na Lei da Gravitação Universal e na Força Centrípeta.
      </p>
      
      <h3 className="font-bold">Fórmulas:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Gravitação Universal: F = G * M * m / r²
          <br />
          <span className="text-sm text-gray-400">
            F = {gravity.toFixed(2)} * {sunMass.toFixed(2)} * {planetMass.toFixed(2)} / {orbitRadius.toFixed(2)}² = {calculateGravitationalForce().toFixed(2)} N
          </span>
        </li>
        <li>
          Força Centrípeta: F = m * v² / r
          <br />
          <span className="text-sm text-gray-400">
            F = {planetMass.toFixed(2)} * {Math.sqrt((gravity * sunMass) / orbitRadius).toFixed(2)}² / {orbitRadius.toFixed(2)} = {calculateCentripetalForce().toFixed(2)} N
          </span>
        </li>
      </ul>
      
      <h3 className="font-bold">Sugestões para o Professor:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Ajuste a massa do Sol e do Planeta para observar como isso afeta a órbita.</li>
        <li>Altere a distância orbital e a velocidade inicial do Planeta.</li>
      </ul>
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
      <TwoBodyCanvas
        sun={sun}
        planet={planet}
        width={dimensions.width}
        height={dimensions.height}
        zoomLevel={zoomLevel}
        cameraOffset={cameraOffset}
      />
      
      <NavigationHeader title="Simulação de Dois Corpos" />
      
      <SimulationGuide 
        title="Guia: Simulação de Dois Corpos"
        content={guideContent}
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

      {/* Controles */}
      <div 
        className={`control-panel fixed right-4 bottom-4 p-4 rounded-lg z-10 w-80 transition-all duration-300 ease-in-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-20'}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-2">Simulação de Dois Corpos</h3>
          <p className="text-xs text-gray-300 mb-4">
            Ajuste as massas e a velocidade para observar como isso afeta a órbita.
          </p>
        </div>
       
        <div className="space-y-6">
        {/* Controle de massa do Sol */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Massa do Sol</label>
            <span className="text-xs text-gray-400">{sunMass.toFixed(1)}</span>
          </div>
          <Slider
            min={500}
            max={5000}
            step={100}
            value={[sunMass]}
            onValueChange={(value) => setSunMass(value[0])}
          />
        </div>

        {/* Controle de massa do Planeta */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Massa do Planeta</label>
            <span className="text-xs text-gray-400">{planetMass.toFixed(1)}</span>
          </div>
          <Slider
            min={1}
            max={200}
            step={1}
            value={[planetMass]}
            onValueChange={(value) => setPlanetMass(value[0])}
          />
        </div>

        {/* Controle de distância orbital */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Distância Orbital</label>
            <span className="text-xs text-gray-400">{orbitRadius.toFixed(1)}</span>
          </div>
          <Slider
            min={100}
            max={500}
            step={10}
            value={[orbitRadius]}
            onValueChange={(value) => setOrbitRadius(value[0])}
          />
        </div>

        {/* Controle de gravidade (G) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Gravidade (G)</label>
            <span className="text-xs text-gray-400">{gravity.toFixed(1)}</span>
          </div>
          <Slider
            min={0.1}
            max={10}
            step={0.1}
            value={[gravity]}
            onValueChange={(value) => setGravity(value[0])}
          />
        </div>

          {/* Controle de velocidade */}
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
              className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTogglePause} // Usando handleTogglePause
              className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              {isPaused ? ( // Verificando o estado isPaused
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
        
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-400 italic">
            A simulação usa a Lei da Gravitação Universal e a Força Centrípeta para calcular a órbita.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoBodySimulation;