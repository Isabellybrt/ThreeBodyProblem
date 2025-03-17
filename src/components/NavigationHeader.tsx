
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ChevronLeft } from 'lucide-react';

interface NavigationHeaderProps {
  title: string;
  showBackButton?: boolean;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ title, showBackButton = true }) => {
  return (
    <div className="absolute top-0 left-0 right-0 h-16 z-20 flex items-center justify-between px-4 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Link to="/">
            <Button 
              variant="outline" 
              size="icon"
              className="group bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 hover:opacity-80 h-8 w-8"
            >
              <ChevronLeft className="text-white group-hover:opacity-80" size={16} />
            </Button>
          </Link>
        )}
        <h1 className="text-lg md:text-xl font-medium text-white ml-2">{title}</h1>
      </div>
      
      
    </div>
  );
};

export default NavigationHeader;
