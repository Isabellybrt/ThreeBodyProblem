
import React, { useRef, useState, useEffect } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import SimulationGuide from '@/components/SimulationGuide';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useRotationPhysics } from '@/utils/rotationPhysics';

const RotationSimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsEngine = useRotationPhysics(containerRef);
  
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  
  // Initial sliders state
  const [sliders, setSliders] = useState({
    planetRotation: 0.01,
    planetOrbit: 0.005,
    moonRotation: 0.02,
    moonOrbit: 0.02
  });
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Rendering the simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const renderFrame = () => {
      const state = physicsEngine.getState();
      
      // Clear canvas with space background
      ctx.fillStyle = 'rgba(5, 8, 22, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw planet trail
      if (state.planet.displayTrail && state.planet.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(state.planet.trail[0].x, state.planet.trail[0].y);
        
        for (let i = 1; i < state.planet.trail.length; i++) {
          ctx.lineTo(state.planet.trail[i].x, state.planet.trail[i].y);
        }
        
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw moon trail
      if (state.moon.displayTrail && state.moon.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(state.moon.trail[0].x, state.moon.trail[0].y);
        
        for (let i = 1; i < state.moon.trail.length; i++) {
          ctx.lineTo(state.moon.trail[i].x, state.moon.trail[i].y);
        }
        
        ctx.strokeStyle = 'rgba(189, 195, 199, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Draw sun
      drawCelestialBody(ctx, state.sun);
      
      // Draw planet
      drawCelestialBody(ctx, state.planet);
      
      // Draw moon
      drawCelestialBody(ctx, state.moon);
      
      requestAnimationFrame(renderFrame);
    };
    
    // Start rendering
    renderFrame();
  }, [dimensions]);
  
  // Draw a celestial body with rotation indicators
  const drawCelestialBody = (ctx: CanvasRenderingContext2D, body: any) => {
    const { position, angle, radius, color } = body;
    
    // Draw glow effect
    const gradient = ctx.createRadialGradient(
      position.x, position.y, radius * 0.5,
      position.x, position.y, radius * 2
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(position.x, position.y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw the main body
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw rotation indicator line
    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
    ctx.lineTo(
      position.x + Math.cos(angle) * radius,
      position.y + Math.sin(angle) * radius
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw small circle at the end of the line
    ctx.beginPath();
    ctx.arc(
      position.x + Math.cos(angle) * radius,
      position.y + Math.sin(angle) * radius,
      2, 0, Math.PI * 2
    );
    ctx.fillStyle = 'white';
    ctx.fill();
  };
  
  // Handle control actions
  const handleReset = () => {
    physicsEngine.resetSimulation();
  };
  
  const handleTogglePause = () => {
    const paused = physicsEngine.togglePause();
    setIsPaused(paused);
  };
  
  const handleTimeScaleChange = (value: number[]) => {
    const newScale = value[0];
    setTimeScale(newScale);
    physicsEngine.setTimeScale(newScale);
  };
  
  const handleSliderChange = (slider: string, value: number) => {
    setSliders(prev => ({ ...prev, [slider]: value }));
    
    // Update the physics engine
    switch (slider) {
      case 'planetRotation':
        physicsEngine.setRotationSpeed('planet', value);
        break;
      case 'planetOrbit':
        physicsEngine.setOrbitSpeed('planet', value);
        break;
      case 'moonRotation':
        physicsEngine.setRotationSpeed('moon', value);
        break;
      case 'moonOrbit':
        physicsEngine.setOrbitSpeed('moon', value);
        break;
    }
  };
  
  const guideContent = (
    <div className="space-y-4">
      <p>
        Esta simulação demonstra os conceitos de translação (movimento orbital) e rotação 
        (giro em torno do próprio eixo) dos corpos celestes.
      </p>
      
      <h3 className="font-bold">Conceitos Físicos:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Movimento orbital (translação)</li>
        <li>Rotação axial</li>
        <li>Período de translação e rotação</li>
        <li>Sistemas de referência</li>
      </ul>
      
      <h3 className="font-bold">Sugestões para o Professor:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Compare os períodos de rotação e translação</li>
        <li>Demonstre o fenômeno de rotação sincronizada (como a Lua)</li>
        <li>Explique como a linha branca indica a rotação do corpo</li>
        <li>Discuta a formação de sistemas planetários</li>
      </ul>
      
      <p className="italic text-xs text-gray-400 mt-2">
        Nosso sistema solar contém exemplos interessantes: Mercúrio e Vênus 
        têm rotações muito lentas, enquanto Júpiter completa uma rotação em apenas 10 horas.
      </p>
    </div>
  );
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-screen relative overflow-hidden bg-space"
    >
      <canvas 
        ref={canvasRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="w-full h-full block"
      />
      
      <NavigationHeader title="Simulação de Translação e Rotação" />
      
      <SimulationGuide 
        title="Guia: Translação e Rotação"
        content={guideContent}
      />
      
      {/* Controles */}
      <div 
        className={`control-panel fixed right-4 bottom-4 p-4 rounded-lg z-10 w-80 transition-all duration-300 ease-in-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-20'}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-2">Translação e Rotação</h3>
          <p className="text-xs text-gray-300 mb-4">
            Ajuste as velocidades de rotação e translação dos corpos celestes.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Planeta */}
          <div className="space-y-3">
            <h4 className="text-sm text-gray-300 flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-[#3498db]"></div>
              Planeta
            </h4>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Rotação</label>
                <span className="text-xs text-gray-400">{sliders.planetRotation.toFixed(3)}</span>
              </div>
              <Slider
                min={0}
                max={0.05}
                step={0.001}
                value={[sliders.planetRotation]}
                onValueChange={(value) => handleSliderChange('planetRotation', value[0])}
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Órbita</label>
                <span className="text-xs text-gray-400">{sliders.planetOrbit.toFixed(3)}</span>
              </div>
              <Slider
                min={0}
                max={0.02}
                step={0.001}
                value={[sliders.planetOrbit]}
                onValueChange={(value) => handleSliderChange('planetOrbit', value[0])}
              />
            </div>
          </div>
          
          {/* Lua */}
          <div className="space-y-3">
            <h4 className="text-sm text-gray-300 flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-[#bdc3c7]"></div>
              Lua
            </h4>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Rotação</label>
                <span className="text-xs text-gray-400">{sliders.moonRotation.toFixed(3)}</span>
              </div>
              <Slider
                min={0}
                max={0.05}
                step={0.001}
                value={[sliders.moonRotation]}
                onValueChange={(value) => handleSliderChange('moonRotation', value[0])}
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Órbita</label>
                <span className="text-xs text-gray-400">{sliders.moonOrbit.toFixed(3)}</span>
              </div>
              <Slider
                min={0}
                max={0.05}
                step={0.001}
                value={[sliders.moonOrbit]}
                onValueChange={(value) => handleSliderChange('moonOrbit', value[0])}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Velocidade</label>
              <span className="text-xs text-gray-400">{timeScale.toFixed(1)}x</span>
            </div>
            <Slider
              min={0.1}
              max={2}
              step={0.1}
              value={[timeScale]}
              onValueChange={handleTimeScaleChange}
            />
          </div>
          
          <div className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTogglePause}
              className="w-10 p-0 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-400 italic">
            A linha branca em cada corpo indica sua rotação em torno do próprio eixo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RotationSimulation;
