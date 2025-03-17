import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Atom, Rocket, Orbit } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-space p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-8">
          Simulações de Física
        </h1>

        <p className="text-lg text-gray-200 leading-relaxed mb-8 bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10">
          Bem-vindo ao laboratório virtual de Física. Este ambiente foi desenvolvido para auxiliar
          professores a demonstrar conceitos complexos de mecânica celeste e física newtoniana através
          de simulações interativas e visualmente atraentes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Card 1 - Problema dos Três Corpos */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white hover:bg-black/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Atom className="mr-2 text-[#ff4d5a]" />
                Problema dos Três Corpos
              </CardTitle>
              <CardDescription className="text-gray-300">
                Comportamento caótico em sistemas dinâmicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Explore o comportamento imprevisível de três corpos sob influência gravitacional mútua,
                um desafio clássico da mecânica celeste sem solução analítica exata.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/simulation" className="w-full">
                <Button className="w-full group transition-all text-black bg-white">
                  <Atom className="mr-2 group-hover:animate-pulse text-[#ff4d5a]" />
                  Explorar Simulação
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Card 2 - Simulação de Dois Corpos */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white hover:bg-black/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Orbit className="mr-2 text-[#42c3f7]" />
                Simulação de Dois Corpos
              </CardTitle>
              <CardDescription className="text-gray-300">
                Órbitas e interação gravitacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Visualize a interação gravitacional entre dois corpos e compreenda
                como a massa afeta suas órbitas, demonstrando os princípios da gravitação universal.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/two-body" className="w-full">
                <Button className="w-full group transition-all text-black bg-white">
                  <Orbit className="mr-2 group-hover:animate-pulse text-[#42c3f7]" />
                  Explorar Simulação
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Card 3 - Simulação de Translação e Rotação */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white hover:bg-black/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Rocket className="mr-2 text-[#fdca40]" />
                Translação e Rotação
              </CardTitle>
              <CardDescription className="text-gray-300">
                Movimento combinado de corpos celestes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Observe como um corpo pode girar em torno de seu próprio eixo (rotação) enquanto
                orbita outro corpo (translação), simulando o movimento de planetas.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/rotation" className="w-full">
                <Button className="w-full group transition-all text-black bg-white">
                  <Rocket className="mr-2 group-hover:animate-pulse text-[#fdca40]" />
                  Explorar Simulação
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="absolute bottom-4 text-white/40 text-sm">
        © 2025 Simulações Educacionais - Todos os direitos reservados.
      </div>
    </div>
  );
};

export default Home;
