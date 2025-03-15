
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Atom } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-space p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          O Problema dos Três Corpos
        </h1>
        
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10">
          <p className="text-lg text-gray-200 leading-relaxed">
            O Problema dos Três Corpos é um desafio clássico da mecânica celeste que estuda o movimento 
            de três objetos no espaço sob influência mútua da gravidade. Diferente do caso com dois corpos, 
            que possui solução analítica exata, o sistema com três corpos apresenta comportamento caótico e 
            imprevisível ao longo do tempo, tornando-se um exemplo fascinante de sistemas dinâmicos complexos 
            na física.
          </p>
        </div>
        
        <Link to="/simulation">
          <Button className="px-8 py-6 text-lg group transition-all" size="lg">
            <Atom className="mr-2 group-hover:animate-pulse" />
            Explorar a Simulação
          </Button>
        </Link>
      </div>
      
      <div className="absolute bottom-4 text-white/40 text-sm">
      © 2025 Todos os direitos reservados.
      </div>
    </div>
  );
};

export default Home;
