
import React, { useRef, useEffect } from 'react';
import { Body } from '@/utils/physicsEngine';

interface SimulationCanvasProps {
  bodies: Body[];
  width: number;
  height: number;
  resetKey: number;
  zoomLevel: number;
  cameraOffset: { x: number; y: number }; // Adicione cameraOffset como prop
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ bodies, width, height, resetKey, zoomLevel, cameraOffset }) => {
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
    ctx.translate(canvas.width / 2 + cameraOffset.x, canvas.height / 2 + cameraOffset.y); // Aplicar o offset da câmera
    ctx.scale(zoomLevel, zoomLevel); // Aplicar o zoom
    ctx.translate(-canvas.width / 2, -canvas.height / 2); // Mover o ponto de origem de volta

    // Renderizar os corpos
    bodies.forEach(body => {
      const position = body.body.position;
      const radius = Math.sqrt(body.mass) * 3;

      // Desenhar a trilha
      if (body.trail && body.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(body.trail[0].x, body.trail[0].y);

        for (let i = 1; i < body.trail.length; i++) {
          ctx.lineTo(body.trail[i].x, body.trail[i].y);
        }

        ctx.strokeStyle = body.trailColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Desenhar o brilho
      const gradient = ctx.createRadialGradient(
        position.x, position.y, 0,
        position.x, position.y, radius * 2
      );
      gradient.addColorStop(0, body.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(position.x, position.y, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar o corpo
      ctx.beginPath();
      ctx.fillStyle = body.color;
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  useEffect(() => {
    const animationFrame = requestAnimationFrame(renderSimulation);
    return () => cancelAnimationFrame(animationFrame);
  }, [bodies, zoomLevel, cameraOffset]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full block bg-space"
    />
  );
};

export default SimulationCanvas;
