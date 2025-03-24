
import React from "react";
import ThreeBodySimulation from "@/components/ThreeBodySimulation";
import NavigationHeader from "@/components/NavigationHeader";
import SimulationGuide from "@/components/SimulationGuide";

const Simulation = () => {
  const guideContent = (
      <div className="space-y-3">
        <h3 className="font-bold">Problema dos Três Corpos</h3>
        <p className="text-sm">
          Sistema caótico onde três corpos interagem gravitacionalmente, impossível de prever a longo prazo.
        </p>
    
        <div className="space-y-2">
          <h4 className="font-bold text-sm">Características Principais:</h4>
          <ul className="list-disc pl-4 text-xs space-y-1">
            <li>Comportamento imprevisível (caos determinístico)</li>
            <li>Pequenas mudanças criam resultados radicalmente diferentes</li>
            <li>Não tem solução matemática geral</li>
            <li>Energia total sempre se conserva</li>
          </ul>
        </div>
    
        <div className="text-xs italic text-gray-400">
          <p>
            Poincaré provou em 1889 que é insolúvel analiticamente, marcando o início da teoria do caos.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen w-full overflow-hidden bg-space relative">
      <NavigationHeader title="Problema dos Três Corpos" />
      
      <ThreeBodySimulation />
      
      <SimulationGuide 
        title="Guia: Problema dos Três Corpos"
        content={guideContent}
      />
    </div>
  );
};

export default Simulation;
