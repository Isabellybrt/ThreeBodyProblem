
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, ChevronUp, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SimulationGuideProps {
  title: string;
  content: React.ReactNode;
  isParametersOpen?: boolean;
  setIsParametersOpen?: (open: boolean) => void;
}

const SimulationGuide: React.FC<SimulationGuideProps> = ({ 
  title, 
  content,
  isParametersOpen = false,
  setIsParametersOpen = () => {}
}) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const isMobile = useIsMobile();

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    
    // No mobile, fecha os parâmetros quando abre o guia
    if (isMobile && isParametersOpen) {
      setIsParametersOpen(false);
    }
  };

  // Função para impedir a propagação do evento de scroll
  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    event.stopPropagation(); // Impede que o evento de scroll seja propagado para o elemento pai
  };

  return (
    <div 
      className={`fixed ${isMobile ? 'left-4 bottom-4' : 'left-4 bottom-4'} ${isMinimized ? '' : 'max-h-[60vh]'} z-20 transition-all duration-300 ${isMobile ? 'w-auto' : 'w-72'}`}
    >
      {isMinimized ? (
        <Button 
          onClick={toggleMinimize} 
          className="flex items-center gap-2 text-white/80 bg-black/80 backdrop-blur-sm hover:bg-black/80"
        >
          <Book size={18} />
          <span>Explicação</span>
          <ChevronUp size={18} />
        </Button>
      ) : (
        <Card 
          className="bg-black/70 backdrop-blur-md border-white/10 text-white overflow-hidden shadow-lg"
          onWheel={handleScroll}
        >
          <CardHeader className="p-3 flex flex-row items-center justify-between bg-black/40">
            <CardTitle className="text-md flex items-center gap-2">
              <Book size={18} />
              {title}
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-white/10"
                onClick={toggleMinimize}
              >
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          
          <div 
            className="overflow-y-auto max-h-[50vh]"
            onWheel={handleScroll}
          >
            <CardContent className="p-3 text-sm">
              {content}
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SimulationGuide;
