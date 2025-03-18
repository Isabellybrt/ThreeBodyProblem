
import React, { useRef, useState } from 'react';
import { useTwoBodySimulation } from '@/hooks/useTwoBodySimulation';
import SimulationCanvas from '@/components/SimulationCanvas';
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
  
  const [
    { bodies, isPaused, dimensions, resetKey },
    { resetSimulation, handleTogglePause, handleSpeedChange, handleMassChange }
  ] = useTwoBodySimulation(containerRef);

  const [speed, setSpeed] = React.useState<number>(1);
  const [showControls, setShowControls] = React.useState<boolean>(true);

  const handleSpeedChangeLocal = (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);
    handleSpeedChange(newSpeed);
  };

  const guideCentent = (
    <div className="space-y-4">
      <p>
        A simulação dos Dois Corpos demonstra a interação gravitacional entre dois objetos. 
        Você pode ajustar as massas para observar como isso afeta suas órbitas.
      </p>
      
      <h3 className="font-bold">Conceitos Físicos:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Lei da Gravitação Universal de Newton</li>
        <li>Conservação do momento angular</li>
        <li>Órbitas elípticas (Leis de Kepler)</li>
      </ul>
      
      <h3 className="font-bold">Sugestões para o Professor:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Aumente a massa do corpo central para demonstrar uma órbita mais circular</li>
        <li>Diminua a massa do corpo central para tornar a órbita mais elíptica</li>
        <li>Explore a relação entre massa, força gravitacional e velocidade orbital</li>
        <li>Compare com o sistema Terra-Lua ou Sol-Terra</li>
      </ul>
      
      <p className="italic text-xs text-gray-400 mt-2">
        Diferente do problema dos três corpos, o sistema de dois corpos possui solução analítica exata 
        através das equações da mecânica clássica.
      </p>
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
    <SimulationCanvas
      bodies={bodies}
      width={dimensions.width}
      height={dimensions.height}
      resetKey={resetKey}
      zoomLevel={zoomLevel}
      cameraOffset={cameraOffset} // Passe o offset da câmera como prop
    />
      
      <NavigationHeader title="Simulação de Dois Corpos" />
      
      <SimulationGuide 
        title="Guia: Simulação de Dois Corpos"
        content={guideCentent}
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

      {/* Controle de simulação */}
      <div 
        className={`control-panel fixed right-4 bottom-4 p-4 rounded-lg z-10 w-80 transition-all duration-300 ease-in-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-20'}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-2">Simulação de Dois Corpos</h3>
          <p className="text-xs text-gray-300 mb-4">
            Ajuste as massas dos corpos para observar como a interação gravitacional afeta suas órbitas.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-4">
            {bodies.map((body) => (
              <div key={body.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300 flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: body.color }}></div>
                    {body.id === 1 ? "Corpo Central" : "Corpo Orbital"}
                  </label>
                  <span className="text-xs text-gray-400">Massa: {body.mass.toFixed(0)}</span>
                </div>
                <Slider
                  className="mt-1"
                  min={body.id === 1 ? 100 : 10}
                  max={body.id === 1 ? 500 : 100}
                  step={body.id === 1 ? 10 : 5}
                  value={[body.mass]}
                  onValueChange={(value) => handleMassChange(body.id, value[0])}
                />
              </div>
            ))}
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
        
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-400 italic">
            O sistema de dois corpos possui solução analítica exata e apresenta órbitas fechadas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoBodySimulation;
