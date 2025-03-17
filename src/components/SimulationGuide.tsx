
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, ChevronDown, ChevronUp, X } from 'lucide-react';

interface SimulationGuideProps {
  title: string;
  content: React.ReactNode;
}

const SimulationGuide: React.FC<SimulationGuideProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);
  const toggleMinimize = () => setIsMinimized(!isMinimized);

  return (
    <div 
      className={`fixed left-4 ${isMinimized ? 'bottom-4' : 'bottom-4 max-h-[calc(100vh-2rem)]'} z-20 transition-all duration-300 w-72`}
    >
      {isMinimized ? (
        <Button 
          onClick={toggleMinimize} 
          className="flex items-center gap-2 bg-black/60 backdrop-blur-sm hover:bg-black/80"
        >
          <Book size={18} />
          <span>Guia do Professor</span>
          <ChevronUp size={18} />
        </Button>
      ) : (
        <Card className="bg-black/60 backdrop-blur-md border-white/10 text-white overflow-hidden shadow-lg">
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
                <ChevronDown size={16} />
              </Button>
            </div>
          </CardHeader>
          
          <div className={`overflow-y-auto transition-all duration-300 max-h-[60vh] ${isOpen ? 'max-h-[60vh]' : 'max-h-0'}`}>
            <CardContent className="p-3 text-sm">
              {content}
            </CardContent>
          </div>
          
          <div className="p-2 bg-black/40 text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs hover:bg-white/10"
              onClick={toggleOpen}
            >
              {isOpen ? 'Ocultar detalhes' : 'Mostrar detalhes'}
              {isOpen ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SimulationGuide;
