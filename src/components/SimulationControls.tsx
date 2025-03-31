
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Pause, Play, ChevronUp, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  showInitially?: boolean;
  isGuideOpen?: boolean;
  setIsGuideOpen?: (open: boolean) => void;
  showControls?: boolean;
  setShowControls?: (show: boolean) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  onReset,
  onRandomize,
  onTogglePause,
  onSpeedChange,
  onMassChange,
  isPaused,
  bodies,
  showInitially = true,
  isGuideOpen = false,
  setIsGuideOpen = () => {},
  showControls = false,
  setShowControls = () => {}
}) => {
  const [speed, setSpeed] = useState<number>(1);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      setShowControls(true);
    }
  }, [isMobile, setShowControls]);

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  const handleMassChange = (id: number, value: number[]) => {
    const newMass = value[0];
    onMassChange(id, newMass);
  };

  const toggleShowControls = () => {
    if (isMobile && isGuideOpen) {
      setIsGuideOpen(false);
    }
    setShowControls(!showControls);
  };

  return (
    <>
      {/* Mobile parameters button - Only show when controls are hidden */}
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
            <h3 className="text-white text-lg font-semibold">Três Corpos</h3>
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
            Simulação do problema clássico dos três corpos, demonstrando seu comportamento caótico e imprevisível.
          </p>
          
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
                className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onTogglePause}              
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
              O problema dos três corpos não possui solução analítica exata, demonstrando o comportamento caótico de sistemas dinâmicos.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SimulationControls;
