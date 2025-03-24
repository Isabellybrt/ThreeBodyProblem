
import React, { useRef, useEffect } from 'react';
import { CelestialBody } from '@/utils/twoBodyPhysics';

interface TwoBodyCanvasProps {
  sun: CelestialBody;
  planet: CelestialBody;
  width: number;
  height: number;
  zoomLevel: number;
  cameraOffset: { x: number; y: number };
}

const TwoBodyCanvas: React.FC<TwoBodyCanvasProps> = ({ sun, planet, width, height, zoomLevel, cameraOffset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }, [width, height]);

  const renderSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fundo escuro do espaço
    ctx.fillStyle = 'rgba(5, 8, 22, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Salvamos o contexto para aplicar transformações
    ctx.save();
    ctx.translate(canvas.width / 2 + cameraOffset.x, canvas.height / 2 + cameraOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Desenha o rastro da órbita do planeta
    if (planet.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(planet.trail[0].x, planet.trail[0].y);
      for (let i = 1; i < planet.trail.length; i++) {
        ctx.lineTo(planet.trail[i].x, planet.trail[i].y);
      }
      ctx.strokeStyle = 'rgba(52, 152, 219, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Desenha os corpos celestes
    drawCelestialBody(ctx, sun);
    drawCelestialBody(ctx, planet);

    // Restaura o contexto
    ctx.restore();
  };

  const drawCelestialBody = (ctx: CanvasRenderingContext2D, body: CelestialBody) => {
    const { position, radius, color } = body;

    // Reduzir o tamanho visual do Sol (mas não fisicamente)
    // Reduzimos drasticamente a escala visual do Sol para ter um tamanho mais proporcional
    const visualScale = body.id === 'sun' ? 0.10 : 1.0;
    const visualRadius = radius * visualScale;
    
    // Ajuste do brilho para ser proporcional ao tamanho visual
    const glowScale = body.id === 'sun' ? 1.4 : 1.5;
    
    // Cria gradiente circular para efeito de brilho
    const gradient = ctx.createRadialGradient(
      position.x, position.y, visualRadius * 0.5,
      position.x, position.y, visualRadius * glowScale
    );
    
    if (body.id === 'sun') {
      gradient.addColorStop(0, '#FFFDE7'); // Núcleo branco-amarelado
      gradient.addColorStop(0.2, color);    // Cor principal
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparente nas bordas
    } else {
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    // Desenha o brilho
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(position.x, position.y, visualRadius * glowScale, 0, Math.PI * 2);
    ctx.fill();

    // Desenha o corpo propriamente dito
    ctx.beginPath();
    ctx.fillStyle = body.id === 'sun' ? '#FDB813' : color;
    ctx.arc(position.x, position.y, visualRadius, 0, Math.PI * 2);
    ctx.fill();

    // Adiciona detalhes para o planeta (opcional)
    if (body.id === 'planet') {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.arc(position.x - visualRadius * 0.3, position.y - visualRadius * 0.3, visualRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number | null = null;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    // Aumentar a velocidade da animação (mas não da física)
    const animationSpeedMultiplier = 2.5; 

    const animate = (timestamp: number) => {
      if (!lastTimestamp || timestamp - lastTimestamp >= frameInterval) {
        lastTimestamp = timestamp;
        renderSimulation();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [sun, planet, zoomLevel, cameraOffset]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full block bg-space"
    />
  );
};

export default TwoBodyCanvas;
