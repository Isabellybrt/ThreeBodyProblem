import React, { useRef, useState } from 'react';
import { useTwoBodySimulation } from '@/hooks/useTwoBodySimulation';
import TwoBodyCanvas from '@/components/TwoBodyCanvas';
import NavigationHeader from '@/components/NavigationHeader';
import SimulationGuide from '@/components/SimulationGuide';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

// Constantes reais (valores físicos)
const REAL_SUN_MASS = 1.98892e30;    // kg
const REAL_PLANET_MASS = 5.9742e24;  // kg

// Constantes escaladas para a simulação
const SCALE_FACTOR = 1e24; // Fator de escala para reduzir os valores
const SCALED_SUN_MASS = REAL_SUN_MASS / SCALE_FACTOR;    // ~1.98892
const SCALED_PLANET_MASS = REAL_PLANET_MASS / SCALE_FACTOR;  // ~0.0059742

const TwoBodySimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [cameraOffset, setCameraOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startDragPosition, setStartDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [speed, setSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [sunMass, setSunMass] = useState<number>(SCALED_SUN_MASS);
  const [planetMass, setPlanetMass] = useState<number>(SCALED_PLANET_MASS);
  const [orbitRadius, setOrbitRadius] = useState<number>(400);

  const [
    { sun, planet, isPaused, dimensions, resetKey },
    { resetSimulation, handleTogglePause, handleSpeedChange, updateSunMass, updatePlanetMass, updateOrbitRadius }
  ] = useTwoBodySimulation(containerRef, orbitRadius, sunMass, planetMass);

  const handleSpeedChangeLocal = (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);
    handleSpeedChange(newSpeed);
  };

  // Atualizei o cálculo das forças para usar valores consistentes
  const calculateGravitationalForce = () => {
    const G = 6.67408e-11; // Constante gravitacional real
    const distance = orbitRadius;
    if (distance === 0) return 0;
    return (G * (sunMass * SCALE_FACTOR) * (planetMass * SCALE_FACTOR)) / (distance * distance);
  };

  const calculateCentripetalForce = () => {
    const G = 6.67408e-11;
    const distance = orbitRadius;
    const velocity = Math.sqrt((G * (sunMass * SCALE_FACTOR)) / distance);
    return ((planetMass * SCALE_FACTOR) * velocity * velocity) / distance;
  };
  
  const formatScientific = (value: number) => {
    if (value === SCALED_SUN_MASS) return "1.98892 × 10³⁰ kg";
    if (value === SCALED_PLANET_MASS) return "5.9742 × 10²⁴ kg";
    return value.toExponential(2);
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
            F = 6.67408 × 10⁻¹¹ * {formatScientific(sunMass)} * {formatScientific(planetMass)} / {orbitRadius.toFixed(2)}² = {calculateGravitationalForce().toExponential(2)} N
          </span>
        </li>
        <li>
          Força Centrípeta: F = m * v² / r
          <br />
          <span className="text-sm text-gray-400">
            F = {formatScientific(planetMass)} * {Math.sqrt((6.67408e-11 * (sunMass * SCALE_FACTOR)) / orbitRadius).toExponential(2)}² / {orbitRadius.toFixed(2)} = {calculateCentripetalForce().toExponential(2)} N
          </span>
        </li>
      </ul>
      
      <h3 className="font-bold">Valores Reais:</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
        <li>Constante Gravitacional (G): 6.67408 × 10⁻¹¹ N.m²/kg²</li>
        <li>Massa do Sol: 1.98892 × 10³⁰ kg</li>
        <li>Massa da Terra: 5.9742 × 10²⁴ kg</li>
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

  // Funções para converter entre escala logarítmica e valores reais
  const massToSliderValue = (mass: number, min: number, max: number) => {
    const logMass = Math.log10(mass);
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    return (logMass - logMin) / (logMax - logMin) * 100;
  };

  const sliderValueToMass = (value: number, min: number, max: number) => {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    const logMass = logMin + (value / 100) * (logMax - logMin);
    return Math.pow(10, logMass);
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

      <div className={`control-panel fixed right-4 bottom-4 p-4 rounded-lg z-10 w-80 transition-all duration-300 ease-in-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-20'}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-2">Simulação de Dois Corpos</h3>
          <p className="text-xs text-gray-300 mb-4">
            Ajuste as massas e a distância para observar como isso afeta a órbita.
          </p>
        </div>
       
        <div className="space-y-6">
          {/* Controle de massa do Sol */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Massa do Sol (kg)</label>
              <span className="text-xs text-gray-400">{formatScientific(sunMass)}</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[massToSliderValue(sunMass, SCALED_SUN_MASS/100, SCALED_SUN_MASS*100)]}
              onValueChange={(value) => {
                const newMass = sliderValueToMass(value[0], SCALED_SUN_MASS/100, SCALED_SUN_MASS*100);
                setSunMass(newMass);
                updateSunMass(newMass);
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatScientific(SCALED_SUN_MASS/100)}</span>
              <span className="font-bold">Real: {formatScientific(SCALED_SUN_MASS)}</span>
              <span>{formatScientific(SCALED_SUN_MASS*100)}</span>
            </div>
          </div>

          {/* Controle de massa do Planeta */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Massa do Planeta (kg)</label>
              <span className="text-xs text-gray-400">{formatScientific(planetMass)}</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[massToSliderValue(planetMass, SCALED_PLANET_MASS/100, SCALED_PLANET_MASS*100)]}
              onValueChange={(value) => {
                const newMass = sliderValueToMass(value[0], SCALED_PLANET_MASS/100, SCALED_PLANET_MASS*100);
                setPlanetMass(newMass);
                updatePlanetMass(newMass);
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatScientific(SCALED_PLANET_MASS/100)}</span>
              <span className="font-bold">Real: {formatScientific(SCALED_PLANET_MASS)}</span>
              <span>{formatScientific(SCALED_PLANET_MASS*100)}</span>
            </div>
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
              onValueChange={(value) => {
                setOrbitRadius(value[0]);
                updateOrbitRadius(value[0]);
              }}
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
              onClick={handleTogglePause}
              className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
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
            Constante Gravitacional (G) fixa em 6.67408 × 10⁻¹¹ N.m²/kg²
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoBodySimulation;
