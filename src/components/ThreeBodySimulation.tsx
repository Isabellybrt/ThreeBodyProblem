
import React, { useRef } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import SimulationCanvas from './SimulationCanvas';
import SimulationControls from './SimulationControls';
import SimulationHeader from './SimulationHeader';

const ThreeBodySimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [
    { bodies, isPaused, dimensions, resetKey },
    { resetSimulation, randomizeSimulation, handleTogglePause, handleSpeedChange, handleMassChange }
  ] = useSimulation(containerRef);

  return (
    <div 
      ref={containerRef} 
      className="simulation-container w-full h-screen relative overflow-hidden"
    >
      <SimulationCanvas 
        bodies={bodies}
        width={dimensions.width}
        height={dimensions.height}
        resetKey={resetKey}
      />
      
      <SimulationControls
        onReset={resetSimulation}
        onRandomize={randomizeSimulation}
        onTogglePause={handleTogglePause}
        onSpeedChange={handleSpeedChange}
        onMassChange={handleMassChange}
        isPaused={isPaused}
        bodies={bodies}
      />
      
      <SimulationHeader />
    </div>
  );
};

export default ThreeBodySimulation;
