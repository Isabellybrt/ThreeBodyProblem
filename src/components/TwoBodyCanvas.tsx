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

    // Limpar o canvas com uma cor de fundo
    ctx.fillStyle = 'rgba(5, 8, 22, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Aplicar o zoom e a translação da câmera
    ctx.save();
    ctx.translate(canvas.width / 2 + cameraOffset.x, canvas.height / 2 + cameraOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Desenhar a trilha do Planeta
    if (planet.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(planet.trail[0].x, planet.trail[0].y);
      for (let i = 1; i < planet.trail.length; i++) {
        ctx.lineTo(planet.trail[i].x, planet.trail[i].y);
      }
      ctx.strokeStyle = 'rgba(52, 152, 219, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Desenhar o Sol
    drawCelestialBody(ctx, sun);

    // Desenhar o Planeta
    drawCelestialBody(ctx, planet);

    ctx.restore();
  };

  const drawCelestialBody = (ctx: CanvasRenderingContext2D, body: CelestialBody) => {
    const { position, radius, color } = body;

    // Desenhar o brilho
    const gradient = ctx.createRadialGradient(
      position.x, position.y, radius * 0.5,
      position.x, position.y, radius * 2
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(position.x, position.y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Desenhar o corpo principal
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  // Loop de animação
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      renderSimulation();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Iniciar o loop de animação
    animationFrameId = requestAnimationFrame(animate);

    // Limpar o loop de animação ao desmontar o componente
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