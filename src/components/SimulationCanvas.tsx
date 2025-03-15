
import React, { useRef, useEffect } from 'react';
import { Body } from '@/utils/physicsEngine';

interface SimulationCanvasProps {
  bodies: Body[];
  width: number;
  height: number;
  resetKey: number; // Reset key to force canvas clearing
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ bodies, width, height, resetKey }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Clear canvas completely when resetKey changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas completely with fully opaque background
        ctx.fillStyle = 'rgba(5, 8, 22, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [resetKey]); // React to changes in resetKey
  
  // Render the simulation on canvas
  const renderSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with a semi-transparent black to create trails
    ctx.fillStyle = 'rgba(5, 8, 22, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all bodies
    bodies.forEach(body => {
      const position = body.body.position;
      const radius = Math.sqrt(body.mass) * 3;
      
      // Draw trail
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
      
      // Draw glow
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
      
      // Draw body
      ctx.beginPath();
      ctx.fillStyle = body.color;
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Update the canvas on each animation frame
  useEffect(() => {
    const animationFrame = requestAnimationFrame(renderSimulation);
    return () => cancelAnimationFrame(animationFrame);
  }, [bodies]);

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
