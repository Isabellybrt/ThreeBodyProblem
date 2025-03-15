
import React from "react";
import ThreeBodySimulation from "@/components/ThreeBodySimulation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home as HomeIcon } from "lucide-react";

const Simulation = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-space relative">
      <Link 
        to="/" 
        className="absolute top-4 right-4 z-10"
      >
        <Button 
          variant="outline" 
          className="group bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 hover:opacity-80"
        >
          <HomeIcon className="mr-2 text-white group-hover:opacity-80" size={16} />
          <span className="text-white group-hover:opacity-80">Voltar</span>
        </Button>
      </Link>


      <ThreeBodySimulation />
    </div>
  );
};

export default Simulation;
