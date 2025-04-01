
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Atom, Rocket, Orbit } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full opacity-20">
          {Array.from({ length: 100 }).map((_, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-white animate-pulse-soft"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                opacity: Math.random() * 0.5 + 0.3
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in z-10">
        <div className="space-y-4 mb-12">
          <div className="mb-4 flex justify-center">
            <img 
              src="/logo.png" 
              alt="Logo Interaverso" 
              className="h-32 w-auto mx-auto"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
            Intera<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Verso</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Um laboratório virtual para explorar e compreender os princípios fundamentais de mecânica celeste e física newtoniana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Card 1 - Simulação de Translação e Rotação */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-md border border-gray-700 text-white hover:shadow-lg hover:shadow-yellow-500/20 hover:border-yellow-600 transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-center text-white text-xl">
                <Rocket className="mr-2 text-[#fdca40]" />
                Translação e Rotação
              </CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Movimento combinado de corpos celestes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Observe como um corpo pode girar em torno de seu próprio eixo (rotação) enquanto orbita outro corpo (translação), simulando o movimento de planetas.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/rotation" className="w-full">
                <Button className="w-full group transition-all bg-gradient-to-r from-[#b08a2d] to-[#8a6e24] text-white hover:from-[#927827] hover:to-[#745c1e]">
                  <Rocket className="mr-2 group-hover:animate-pulse" />
                  Explorar Simulação
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Card 2 - Simulação de Dois Corpos */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-md border border-gray-700 text-white hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-center text-white text-xl">
                <Orbit className="mr-2 text-[#42c3f7]" />
                Simulação de Dois Corpos
              </CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Órbitas e interação gravitacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 text-center">
                Visualize a interação gravitacional entre dois corpos e compreenda como a massa afeta suas órbitas, demostrando os princípios da gravitação universal.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/two-body" className="w-full">
                <Button className="w-full group transition-all bg-gradient-to-r from-[#2d6a88] to-[#24536c] text-white hover:from-[#285b78] hover:to-[#1e475d]">
                  <Orbit className="mr-2 group-hover:animate-pulse" />
                  Explorar Simulação
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Card 3 - Problema dos Três Corpos */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-md border border-gray-700 text-white hover:shadow-lg hover:shadow-red-500/20 hover:border-red-600 transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-center text-white text-xl">
                <Atom className="mr-2 text-[#ff4d5a]" />
                Problema dos Três Corpos
              </CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Comportamento caótico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 text-center">
                Explore o comportamento imprevisível de três corpos sob influência gravitacional mútua,
                um desafio clássico da mecânica celeste sem solução analítica exata.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/simulation" className="w-full">
                <Button className="w-full group transition-all bg-gradient-to-r from-[#b03a42] to-[#8a2f36] text-white hover:from-[#922d34] hover:to-[#7a262d]">
                  <Atom className="mr-2 group-hover:animate-pulse" />
                  Explorar Simulação
                </Button>
              </Link>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Home;