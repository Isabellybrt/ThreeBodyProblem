
import { Bodies, Body, Composite, Engine, Events, Render, Runner, IEventCollision } from "matter-js";

// Constants
export const G = 6.67430e-11; // Universal gravitational constant
export const scaleFactor = 1e9; // Scale factor to make forces visible in simulation
export const maxTrailPoints = 150; // Maximum number of trail points

// Types
export interface SimulationObjects {
  engine: Matter.Engine;
  render: Matter.Render;
  runner: Matter.Runner;
  body01: Matter.Body;
  body02: Matter.Body;
  trailPositions: { x: number; y: number }[];
  initialParams: {
    sunMass: number;
    planetMass: number;
    initialVelocity: number;
    orbitalDistance: number;
    simulationSpeed: number;
  };
}

// Calculate body size based on mass
const calculateBodySize = (mass: number, isSun: boolean) => {
  if (isSun) {
    // Sun size calculation: base size + square root scaling
    return 20 + Math.sqrt(mass) * 0.8;
  } else {
    // Planet size calculation: smaller base size + linear scaling
    return 10 + mass * 0.15;
  }
};

// Initialize physics simulation
export const initPhysicsSimulation = (
  container: HTMLElement, 
  sunMass: number = 900, 
  planetMass: number = 1, 
  initialVelocity: number = 4,
  orbitalDistance: number = 400,
  simulationSpeed: number = 1 
): SimulationObjects => {
  // Create engine
  const engine = Engine.create();
  engine.gravity.y = 0; // Disable gravity

  // Create renderer
  const render = Render.create({
    element: container,
    engine: engine,
    options: {
      width: container.clientWidth,
      height: container.clientHeight,
      wireframes: false,
      background: '#000000',
      pixelRatio: window.devicePixelRatio
    },
  });
  
  const runner = Runner.create();
  runner.delta = (1000/60) / Math.max(0.1, Math.min(simulationSpeed, 10));

  // Calculate body sizes based on mass
  const sunSize = calculateBodySize(sunMass, true);
  const planetSize = calculateBodySize(planetMass, false);

  // Calculate center position
  const centerX = container.clientWidth / 2;
  const centerY = container.clientHeight / 2;

  // Create sun (body01) at center
  const body01 = Bodies.circle(
    centerX, 
    centerY, 
    sunSize, 
    { 
      mass: sunMass, 
      frictionAir: 0, 
      friction: 0, 
      frictionStatic: 0, 
      restitution: 0,
      isStatic: false, 
      render: {
        fillStyle: '#f5a623',
        strokeStyle: '#f7b955',
        lineWidth: 2
      } 
    }
  );
  
  // Create planet (body02) at a distance from the sun
  const body02 = Bodies.circle(
    centerX + orbitalDistance, 
    centerY, 
    planetSize, 
    { 
      mass: planetMass, 
      frictionAir: 0, 
      friction: 0, 
      frictionStatic: 0, 
      restitution: 0,
      render: {
        fillStyle: '#4da6ff',
        strokeStyle: '#75b9ff',
        lineWidth: 1
      } 
    }
  );
  Render.world(render);
  // Calculate initial velocity perpendicular to the line between bodies
  const dx_initial = body02.position.x - body01.position.x;
  const dy_initial = body02.position.y - body01.position.y;
  const distance_initial = Math.sqrt(dx_initial * dx_initial + dy_initial * dy_initial);

  // Calculate perpendicular vector (rotate 90 degrees counterclockwise)
  const perpendicular = {
    x: -dy_initial / distance_initial,
    y: dx_initial / distance_initial,
  };

  // Apply initial velocity to body02
  Body.setVelocity(body02, {
    x: perpendicular.x * initialVelocity,
    y: perpendicular.y * initialVelocity,
  });

  // Add bodies to the world
  Composite.add(engine.world, [body01, body02]);

  // Set time scale for simulation speed
  runner.delta = 1000/60;

  // Array to store trail positions
  const trailPositions: { x: number; y: number }[] = [];

  return { 
    engine, 
    render, 
    runner, 
    body01, 
    body02, 
    trailPositions,
    initialParams: {
      sunMass,
      planetMass,
      initialVelocity,
      orbitalDistance,
      simulationSpeed: 1
    }
  };
};

export const updateSimulationParameters = (
  simulation: SimulationObjects, 
  params: {
    sunMass?: number;
    planetMass?: number;
    initialVelocity?: number;
    simulationSpeed?: number;
    orbitalDistance?: number;
  }
) => {
  const { body01, body02, render, initialParams, runner } = simulation;

  // Atualiza a velocidade da simulação
  if (params.simulationSpeed !== undefined) {
    // Mantém a física original, apenas ajusta a velocidade de execução
    runner.delta = (1000/60) / Math.max(0.1, Math.min(params.simulationSpeed, 10));
    simulation.initialParams.simulationSpeed = params.simulationSpeed;
  }

  // Atualiza o Sol (body01)
  if (params.sunMass !== undefined && params.sunMass !== body01.mass) {
    const newSize = calculateBodySize(params.sunMass, true);
    const scaleFactor = newSize / body01.circleRadius;
    
    Body.scale(body01, scaleFactor, scaleFactor);
    Body.setMass(body01, params.sunMass);
    initialParams.sunMass = params.sunMass;
  }

  // Atualiza o Planeta (body02)
  if (params.planetMass !== undefined && params.planetMass !== body02.mass) {
    const newSize = calculateBodySize(params.planetMass, false);
    const scaleFactor = newSize / body02.circleRadius;
    
    Body.scale(body02, scaleFactor, scaleFactor);
    Body.setMass(body02, params.planetMass);
    initialParams.planetMass = params.planetMass;
  }

  // Atualiza a distância orbital
  if (params.orbitalDistance !== undefined && 
      params.orbitalDistance !== initialParams.orbitalDistance) {
    
    const centerX = render.options.width! / 2;
    const centerY = render.options.height! / 2;
    
    // Calcula a nova posição mantendo o ângulo atual
    const currentAngle = Math.atan2(
      body02.position.y - body01.position.y,
      body02.position.x - body01.position.x
    );
    
    const newPosition = {
      x: body01.position.x + Math.cos(currentAngle) * params.orbitalDistance,
      y: body01.position.y + Math.sin(currentAngle) * params.orbitalDistance
    };
    
    Body.setPosition(body02, newPosition);
    initialParams.orbitalDistance = params.orbitalDistance;
  }

  // Atualiza a velocidade inicial se necessário
  if (params.initialVelocity !== undefined && 
      params.initialVelocity !== initialParams.initialVelocity) {
    
    initialParams.initialVelocity = params.initialVelocity;
    
    const dx = body02.position.x - body01.position.x;
    const dy = body02.position.y - body01.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const perpendicular = {
      x: -dy / distance,
      y: dx / distance
    };
    
    Body.setVelocity(body02, {
      x: perpendicular.x * params.initialVelocity,
      y: perpendicular.y * params.initialVelocity
    });
  }

  // Força o redesenho imediato
  Render.world(render);
};

// Start the simulation
export const startSimulation = (simulation: SimulationObjects): void => {
  Runner.start(simulation.runner, simulation.engine);
  Render.run(simulation.render);
};

// Stop the simulation
export const stopSimulation = (simulation: SimulationObjects): void => {
  Runner.stop(simulation.runner);
  Render.stop(simulation.render);
};

// Reset the simulation
// Adicione esta função ao seu twoBodyPhysics.ts
export const resetSimulation = (simulation: SimulationObjects): void => {
  const { engine, render, body01, body02, trailPositions, initialParams } = simulation;
  
  // 1. Para a simulação
  stopSimulation(simulation);
  
  // 2. Calcula as posições iniciais
  const centerX = render.options.width! / 2;
  const centerY = render.options.height! / 2;
  
  // 3. Reseta as posições dos corpos
  Body.setPosition(body01, { x: centerX, y: centerY });
  Body.setVelocity(body01, { x: 0, y: 0 });
  
  Body.setPosition(body02, { 
    x: centerX + initialParams.orbitalDistance, 
    y: centerY 
  });
  
  // 4. Reseta a velocidade do planeta (body02)
  const dx = body02.position.x - body01.position.x;
  const dy = body02.position.y - body01.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const perpendicular = {
    x: -dy / distance,
    y: dx / distance,
  };
  
  Body.setVelocity(body02, {
    x: perpendicular.x * initialParams.initialVelocity,
    y: perpendicular.y * initialParams.initialVelocity,
  });
  
  // 5. Limpa o rastro orbital
  simulation.trailPositions.length = 0; 

  
  // 7. Redesenha para mostrar as posições resetadas
  Render.world(render);
};

// Setup physics events
export const setupPhysicsEvents = (simulation: SimulationObjects): void => {
  const { engine, render, body01, body02, trailPositions } = simulation;

  // Update physics in each tick
  Events.on(engine, 'beforeUpdate', function () {
    
    // Calculate distance between bodies
    const dx = body02.position.x - body01.position.x;
    const dy = body02.position.y - body01.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate gravitational force magnitude
    const forceMagnitude = (G * body01.mass * body02.mass) / (distance * distance);
    
    // Scale the force to be visible in simulation
    const scaledForce = forceMagnitude * scaleFactor;

    // Calculate force components
    const force = {
      x: (scaledForce * dx) / distance,
      y: (scaledForce * dy) / distance,
    };

    // Apply forces to both bodies (equal and opposite)
    Body.applyForce(body01, body01.position, {
      x: force.x,
      y: force.y,
    });

    Body.applyForce(body02, body02.position, {
      x: -force.x,
      y: -force.y,
    });

    // Add current position of body02 to trail
    trailPositions.push({ x: body02.position.x, y: body02.position.y });

    // Limit the number of trail points
    if (trailPositions.length > maxTrailPoints) {
      trailPositions.shift();
    }
  });

  // Render trails
  Events.on(render, 'afterRender', function () {
    const context = render.context;
    context.save();
    context.scale(
      render.options.width! / (render.bounds.max.x - render.bounds.min.x),
      render.options.height! / (render.bounds.max.y - render.bounds.min.y)
    );
    context.translate(-render.bounds.min.x, -render.bounds.min.y);

    // Draw orbit trail
    context.beginPath();
    context.strokeStyle = 'rgba(77, 166, 255, 0.8)'; // Brighter trail color
    context.lineWidth = 2; // Thicker trail line

    for (let i = 0; i < trailPositions.length; i++) {
      const pos = trailPositions[i];
      if (i === 0) {
        context.moveTo(pos.x, pos.y);
      } else {
        context.lineTo(pos.x, pos.y);
      }
    }

    context.stroke();
    
    // Add glow effect to sun (body01)
    const sunGlow = 30; // Glow radius
    const sunGradient = context.createRadialGradient(
      body01.position.x, body01.position.y, body01.circleRadius,
      body01.position.x, body01.position.y, body01.circleRadius + sunGlow
    );
    
    sunGradient.addColorStop(0, 'rgba(255, 166, 35, 0.3)');
    sunGradient.addColorStop(1, 'rgba(255, 166, 35, 0)');
    
    context.beginPath();
    context.fillStyle = sunGradient;
    context.arc(body01.position.x, body01.position.y, body01.circleRadius + sunGlow, 0, Math.PI * 2);
    context.fill();
    
    // Add glow effect to planet (body02)
    const planetGlow = 15; // Glow radius
    const planetGradient = context.createRadialGradient(
      body02.position.x, body02.position.y, body02.circleRadius,
      body02.position.x, body02.position.y, body02.circleRadius + planetGlow
    );
    
    planetGradient.addColorStop(0, 'rgba(77, 166, 255, 0.3)');
    planetGradient.addColorStop(1, 'rgba(77, 166, 255, 0)');
    
    context.beginPath();
    context.fillStyle = planetGradient;
    context.arc(body02.position.x, body02.position.y, body02.circleRadius + planetGlow, 0, Math.PI * 2);
    context.fill();
    
    context.restore();
  });
};

export const handleZoomIn = (simulation: SimulationObjects): void => {
  const zoomFactor = -0.1; // Negative for zoom in
  
  const viewWidth = simulation.render.bounds.max.x - simulation.render.bounds.min.x;
  const viewHeight = simulation.render.bounds.max.y - simulation.render.bounds.min.y;

  const newWidth = viewWidth * (1 + zoomFactor);
  const newHeight = viewHeight * (1 + zoomFactor);

  const centerX = (simulation.render.bounds.min.x + simulation.render.bounds.max.x) / 2;
  const centerY = (simulation.render.bounds.min.y + simulation.render.bounds.max.y) / 2;

  simulation.render.bounds.min.x = centerX - newWidth / 2;
  simulation.render.bounds.max.x = centerX + newWidth / 2;
  simulation.render.bounds.min.y = centerY - newHeight / 2;
  simulation.render.bounds.max.y = centerY + newHeight / 2;

  // Força o redesenho imediato
  Render.lookAt(simulation.render, {
    min: { x: simulation.render.bounds.min.x, y: simulation.render.bounds.min.y },
    max: { x: simulation.render.bounds.max.x, y: simulation.render.bounds.max.y }
  });
  Render.world(simulation.render); // Adicione esta linha
};

export const handleZoomOut = (simulation: SimulationObjects): void => {
  const zoomFactor = 0.1; // Positive for zoom out
  
  const viewWidth = simulation.render.bounds.max.x - simulation.render.bounds.min.x;
  const viewHeight = simulation.render.bounds.max.y - simulation.render.bounds.min.y;

  const newWidth = viewWidth * (1 + zoomFactor);
  const newHeight = viewHeight * (1 + zoomFactor);

  const centerX = (simulation.render.bounds.min.x + simulation.render.bounds.max.x) / 2;
  const centerY = (simulation.render.bounds.min.y + simulation.render.bounds.max.y) / 2;

  simulation.render.bounds.min.x = centerX - newWidth / 2;
  simulation.render.bounds.max.x = centerX + newWidth / 2;
  simulation.render.bounds.min.y = centerY - newHeight / 2;
  simulation.render.bounds.max.y = centerY + newHeight / 2;

  // Força o redesenho imediato
  Render.lookAt(simulation.render, {
    min: { x: simulation.render.bounds.min.x, y: simulation.render.bounds.min.y },
    max: { x: simulation.render.bounds.max.x, y: simulation.render.bounds.max.y }
  });
  Render.world(simulation.render); // Adicione esta linha
};

export const setupZoom = (container: HTMLElement, simulation: SimulationObjects): void => {
  container.addEventListener("wheel", function (event) {
    event.preventDefault();
    
    const zoomFactor = 0.1;
    const delta = event.deltaY > 0 ? zoomFactor : -zoomFactor;

    const viewWidth = simulation.render.bounds.max.x - simulation.render.bounds.min.x;
    const viewHeight = simulation.render.bounds.max.y - simulation.render.bounds.min.y;

    const newWidth = viewWidth * (1 + delta);
    const newHeight = viewHeight * (1 + delta);

    const centerX = (simulation.render.bounds.min.x + simulation.render.bounds.max.x) / 2;
    const centerY = (simulation.render.bounds.min.y + simulation.render.bounds.max.y) / 2;

    simulation.render.bounds.min.x = centerX - newWidth / 2;
    simulation.render.bounds.max.x = centerX + newWidth / 2;
    simulation.render.bounds.min.y = centerY - newHeight / 2;
    simulation.render.bounds.max.y = centerY + newHeight / 2;

    // Força o redesenho imediato
    Render.lookAt(simulation.render, {
      min: { x: simulation.render.bounds.min.x, y: simulation.render.bounds.min.y },
      max: { x: simulation.render.bounds.max.x, y: simulation.render.bounds.max.y }
    });
    Render.world(simulation.render); // Adicione esta linha
  });
};

// Setup drag to move functionality
export const setupDragToMove = (container: HTMLElement, simulation: SimulationObjects): void => {
  container.addEventListener('canvas-drag', function(event: Event) {
    const customEvent = event as CustomEvent;
    const { dx, dy } = customEvent.detail;
    
    // Limpa completamente o canvas antes de mover
    const context = simulation.render.context;
    context.clearRect(0, 0, simulation.render.canvas.width, simulation.render.canvas.height);
    
    // Aplica o movimento
    const viewWidth = simulation.render.bounds.max.x - simulation.render.bounds.min.x;
    const canvasWidth = container.clientWidth;
    const scaleFactor = viewWidth / canvasWidth;
    
    simulation.render.bounds.min.x -= dx * scaleFactor;
    simulation.render.bounds.max.x -= dx * scaleFactor;
    simulation.render.bounds.min.y -= dy * scaleFactor;
    simulation.render.bounds.max.y -= dy * scaleFactor;
    
    // Força um redesenho completo
    Render.lookAt(simulation.render, {
      min: { x: simulation.render.bounds.min.x, y: simulation.render.bounds.min.y },
      max: { x: simulation.render.bounds.max.x, y: simulation.render.bounds.max.y }
    });
    
    // Redesenha todos os elementos
    Render.world(simulation.render);
  });
};

// Clean up the simulation
export const cleanupSimulation = (simulation: SimulationObjects): void => {
  if (simulation) {
    Events.off(simulation.engine, "engine");
    Events.off(simulation.render, "render");
    Render.stop(simulation.render);
    Runner.stop(simulation.runner);
    Engine.clear(simulation.engine);
  }
};
