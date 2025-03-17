
import React from "react";
import ThreeBodySimulation from "@/components/ThreeBodySimulation";
import NavigationHeader from "@/components/NavigationHeader";
import SimulationGuide from "@/components/SimulationGuide";

const Simulation = () => {
  const guideContent = (
    <div className="space-y-4">
      <p>
        O Problema dos Três Corpos é um desafio clássico da mecânica celeste que demonstra como
        sistemas determinísticos podem apresentar comportamento caótico.
      </p>
      
      <h3 className="font-bold">Conceitos Físicos:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Sistemas dinâmicos caóticos</li>
        <li>Sensibilidade às condições iniciais</li>
        <li>Imprevisibilidade a longo prazo</li>
        <li>Conservação de energia e momento</li>
      </ul>
      
      <h3 className="font-bold">Sugestões para o Professor:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Compare com sistemas de dois corpos (previsíveis)</li>
        <li>Destaque como pequenas variações nas massas produzem trajetórias completamente diferentes</li>
        <li>Utilize o botão "Aleatório" para demonstrar diferentes configurações</li>
        <li>Discuta aplicações na astronomia e na física do caos</li>
      </ul>
      
      <p className="italic text-xs text-gray-400 mt-2">
        Henri Poincaré provou que o problema dos três corpos não possui solução geral em termos
        de funções analíticas fechadas, demonstrando os limites do determinismo laplaciano.
      </p>
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
