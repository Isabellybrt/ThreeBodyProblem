
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Pause, Play } from 'lucide-react';

interface SimulationControlsProps {
  onReset: () => void;
  onRandomize: () => void;
  onTogglePause: () => void;
  onSpeedChange: (speed: number) => void;
  onMassChange: (id: number, mass: number) => void;
  isPaused: boolean;
  bodies: {
    id: number;
    mass: number;
    color: string;
  }[];
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  onReset,
  onRandomize,
  onTogglePause,
  onSpeedChange,
  onMassChange,
  isPaused,
  bodies
}) => {
  const [speed, setSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  const handleMassChange = (id: number, value: number[]) => {
    const newMass = value[0];
    onMassChange(id, newMass);
  };

  return (
    <div className={`control-panel fixed right-4 bottom-4 p-4 rounded-lg z-10 w-80 transition-all duration-300 ease-in-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-20'}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}>
      
      <div className="mb-6">
        <h3 className="text-white text-lg font-semibold mb-2">Três Corpos</h3>
        <p className="text-xs text-gray-300 mb-4">
          Simulação do problema clássico dos três corpos, demonstrando seu comportamento caótico e imprevisível.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          {bodies.map((body) => (
            <div key={body.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300 flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: body.color }}></div>
                  Corpo {body.id} 
                </label>
                <span className="text-xs text-gray-400">Massa: {body.mass.toFixed(1)}</span>
              </div>
              <Slider
                className="mt-1"
                min={1}
                max={100}
                step={1}
                value={[body.mass]}
                onValueChange={(value) => handleMassChange(body.id, value)}
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
            onValueChange={handleSpeedChange}
          />
        </div>
        
        <div className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRandomize}
            className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            Aleatório
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onTogglePause}
            className="w-10 p-0 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-400 italic">
          O problema dos três corpos não possui solução analítica exata, demonstrando o comportamento caótico de sistemas dinâmicos.
        </p>
      </div>
    </div>
  );
};

export default SimulationControls;
