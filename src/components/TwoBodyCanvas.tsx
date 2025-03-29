import React, { forwardRef, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TwoBodyCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  isPaused: boolean;
  onWheel?: (e: React.WheelEvent) => void;
}

const TwoBodyCanvas = forwardRef<HTMLDivElement, TwoBodyCanvasProps>(
  ({ className, isPaused, onWheel, ...props }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !ref || typeof ref === 'function' || !ref.current) return;
      
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragStart.current = { x: e.clientX, y: e.clientY };
      
      const moveEvent = new CustomEvent('canvas-drag', {
        detail: { dx, dy, isPaused }
      });
      
      ref.current.dispatchEvent(moveEvent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    useEffect(() => {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
      <div
        ref={(el) => {
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
        }}
        className={cn(
          "w-full h-full bg-black",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          className
        )}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={onWheel}
        {...props}
      />
    );
  }
);

TwoBodyCanvas.displayName = "TwoBodyCanvas";

export default TwoBodyCanvas;
