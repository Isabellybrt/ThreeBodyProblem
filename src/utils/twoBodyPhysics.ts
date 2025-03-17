
import Matter from 'matter-js';

// Gravitational constant - scaled for our simulation
const G: number = 0.3;

// Maximum number of trail points to store
const MAX_TRAIL_POINTS: number = 200;

// Maximum velocity to prevent bodies from moving too fast
const MAX_VELOCITY: number = 10;

export interface Body {
  id: number;
  body: Matter.Body;
  mass: number;
  color: string;
  trailColor: string;
  trail: { x: number; y: number }[];
}

export interface SimulationOptions {
  width: number;
  height: number;
  gravitationalConstant?: number;
}

export interface BodyParams {
  mass: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius?: number;
  color: string;
  trailColor: string;
}

export class TwoBodyPhysics {
  private engine: Matter.Engine;
  private world: Matter.World;
  private bodies: Body[] = [];
  private timeScale: number = 1;
  private width: number;
  private height: number;
  private G: number;
  private paused: boolean = false;
  private runner: Matter.Runner;

  constructor(options: SimulationOptions) {
    this.width = options.width;
    this.height = options.height;
    this.G = options.gravitationalConstant || G;

    // Create the physics engine
    this.engine = Matter.Engine.create({
      // Disable gravity since we'll implement our own
      gravity: { x: 0, y: 0, scale: 0 }
    });

    this.world = this.engine.world;

    // Create a runner to handle the physics updates
    this.runner = Matter.Runner.create({
      isFixed: false,
      delta: 16.666
    });

    // Before update event to apply custom gravity
    Matter.Events.on(this.engine, 'beforeUpdate', this.applyGravity);

    // After update event to update trails
    Matter.Events.on(this.engine, 'afterUpdate', this.updateTrails);
  }

  // Initialize the bodies with given parameters
  public initBodies(bodyParams: BodyParams[]): Body[] {
    // Clear any existing bodies
    this.bodies.forEach((body: Body) => {
      Matter.Composite.remove(this.world, body.body);
    });

    this.bodies = [];

    // Create new bodies
    bodyParams.forEach((params: BodyParams, index: number) => {
      const radius: number = params.radius || Math.sqrt(params.mass) * 4;

      const body: Matter.Body = Matter.Bodies.circle(
        params.x,
        params.y,
        radius,
        {
          frictionAir: 0,
          friction: 0,
          restitution: 1,
          // Set initial velocity
          velocity: { x: params.velocityX, y: params.velocityY }
        }
      );

      // Set mass
      Matter.Body.setMass(body, params.mass);

      // Add body to world
      Matter.Composite.add(this.world, body);

      // Add to our bodies array with trail
      this.bodies.push({
        id: index + 1,
        body,
        mass: params.mass,
        color: params.color,
        trailColor: params.trailColor,
        trail: [{
          x: params.x,
          y: params.y
        }]
      });
    });

    return this.bodies;
  }

  // Set the mass of a body by its array index
  public setMass(index: number, mass: number): void {
    if (index < 0 || index >= this.bodies.length) return;

    const body: Body = this.bodies[index];

    // Update mass in Matter.js physics engine
    Matter.Body.setMass(body.body, mass);

    // Update our record
    body.mass = mass;
  }

  // Get the bodies for rendering
  public getBodies(): Body[] {
    return this.bodies;
  }

  // Set simulation speed
  public setTimeScale(scale: number): void {
    this.timeScale = scale;
  }

  // Update the simulation
  public update(): void {
    if (this.paused) return;

    // Run the engine with our time scale
    Matter.Engine.update(this.engine, 16.666 * this.timeScale);
  }

  // Toggle pause state
  public togglePause(): boolean {
    this.paused = !this.paused;
    if (this.paused) {
      Matter.Runner.stop(this.runner);
    } else {
      Matter.Runner.start(this.runner, this.engine);
    }
    return this.paused;
  }

  // Reset body positions and velocities
  public resetBodies(): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    if (this.bodies.length === 2) {
      // For a two-body system, set them up in a basic orbital configuration
      const distance = Math.min(this.width, this.height) * 0.2;
      
      // Body 1: Central mass (stationary)
      Matter.Body.setPosition(this.bodies[0].body, {
        x: centerX,
        y: centerY
      });
      Matter.Body.setVelocity(this.bodies[0].body, {
        x: 0,
        y: 0
      });
      
      // Body 2: Orbiting body
      Matter.Body.setPosition(this.bodies[1].body, {
        x: centerX + distance,
        y: centerY
      });
      
      // Calculate orbital velocity based on central body mass
      const orbitalVelocity = Math.sqrt((this.G * this.bodies[0].mass) / distance) * 0.6;
      
      Matter.Body.setVelocity(this.bodies[1].body, {
        x: 0,
        y: orbitalVelocity
      });
      
      // Clear trails
      this.bodies.forEach((body, i) => {
        const pos = body.body.position;
        body.trail = [{ x: pos.x, y: pos.y }];
      });
    }
  }

  // Properly destroy the physics engine and clear bodies
  public destroy(): void {
    // Stop the runner
    Matter.Runner.stop(this.runner);

    // Remove all bodies from the world
    this.bodies.forEach((body: Body) => {
      Matter.Composite.remove(this.world, body.body);
    });

    // Clear our bodies array
    this.bodies = [];

    // Clear all events
    Matter.Events.off(this.engine, 'beforeUpdate', this.applyGravity);
    Matter.Events.off(this.engine, 'afterUpdate', this.updateTrails);

    // Clear the world and engine
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
  }

  // Private methods
  private applyGravity = (): void => {
    if (this.paused) return;

    // Apply gravitational forces between all pairs of bodies
    for (let i: number = 0; i < this.bodies.length; i++) {
      for (let j: number = i + 1; j < this.bodies.length; j++) {
        const bodyA: Matter.Body = this.bodies[i].body;
        const bodyB: Matter.Body = this.bodies[j].body;

        // Calculate distance between bodies
        const dx: number = bodyB.position.x - bodyA.position.x;
        const dy: number = bodyB.position.y - bodyA.position.y;
        const distanceSq: number = dx * dx + dy * dy;
        const distance: number = Math.sqrt(distanceSq);

        // Avoid division by zero and unrealistic forces at very close distances
        if (distanceSq === 0 || distance < 1) continue;

        // Calculate gravitational force magnitude: F = G * (m1 * m2) / r^2
        const forceMagnitude: number =
          this.G * bodyA.mass * bodyB.mass / distanceSq;

        // Calculate force components
        const force: { x: number; y: number } = {
          x: (forceMagnitude * dx) / distance,
          y: (forceMagnitude * dy) / distance
        };

        // Apply forces to both bodies (Newton's third law)
        Matter.Body.applyForce(bodyA, bodyA.position, force);
        Matter.Body.applyForce(bodyB, bodyB.position, {
          x: -force.x,
          y: -force.y
        });
      }
    }
    
    // Cap velocity of all bodies
    this.bodies.forEach((body) => {
      const velocity = body.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      if (speed > MAX_VELOCITY) {
        const ratio = MAX_VELOCITY / speed;
        Matter.Body.setVelocity(body.body, {
          x: velocity.x * ratio,
          y: velocity.y * ratio
        });
      }
    });
  };

  private updateTrails = (): void => {
    if (this.paused) return;

    // Update trail for each body
    this.bodies.forEach((body: Body) => {
      const lastPoint = body.trail[body.trail.length - 1];
      const currentPos = body.body.position;

      // Only add a point if it's sufficiently different from the last one
      const minDistance = 1; // Minimum distance to add a new point
      const dx = currentPos.x - lastPoint.x;
      const dy = currentPos.y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > minDistance) {
        body.trail.push({
          x: currentPos.x,
          y: currentPos.y
        });

        // Limit trail length
        if (body.trail.length > MAX_TRAIL_POINTS) {
          body.trail.shift();
        }
      }
    });
  };

  // Start the physics runner
  public start(): void {
    Matter.Runner.run(this.runner, this.engine);
  }
}
