import Matter from 'matter-js';

// Gravitational constant - scaled for our simulation
const G: number = 0.1;

// Maximum number of trail points to store
const MAX_TRAIL_POINTS: number = 200;

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

export interface ResetBodyParams {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}

export class ThreeBodyPhysics {
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

    // Add collision detection
    Matter.Events.on(this.engine, 'collisionStart', this.handleCollision);
  }

  // Initialize the three bodies with given parameters
  public initBodies(bodyParams: BodyParams[]): Body[] {
    // Clear any existing bodies
    this.bodies.forEach((body: Body) => {
      Matter.Composite.remove(this.world, body.body);
    });

    this.bodies = [];

    // Create new bodies
    bodyParams.forEach((params: BodyParams, index: number) => {
      const radius: number = params.radius || Math.sqrt(params.mass) * 4; // Increased radius for better visibility

      const body: Matter.Body = Matter.Bodies.circle(
        params.x,
        params.y,
        radius,
        {
          // Enable physical collisions
          collisionFilter: { group: 0, category: 0x0001, mask: 0x0001 },
          frictionAir: 0,
          friction: 0,
          restitution: 0, // Perfectly elastic collisions
          // Set initial velocity
          velocity: { x: params.velocityX, y: params.velocityY }
        }
      );

      // Set mass (Matter.js uses density and area, so we need to adjust)
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
  public resetBodies(bodyParams: ResetBodyParams[]): void {
    bodyParams.forEach((params: ResetBodyParams, index: number) => {
      if (index < this.bodies.length) {
        Matter.Body.setPosition(this.bodies[index].body, {
          x: params.x,
          y: params.y
        });

        Matter.Body.setVelocity(this.bodies[index].body, {
          x: params.velocityX,
          y: params.velocityY
        });

        // Clear trails
        this.bodies[index].trail = [{
          x: params.x,
          y: params.y
        }];
      }
    });
  }

  // Clear all trails
  public clearTrails(): void {
    this.bodies.forEach((body: Body) => {
      body.trail = [{
        x: body.body.position.x,
        y: body.body.position.y
      }];
    });
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
    Matter.Events.off(this.engine, 'collisionStart', this.handleCollision);

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

        // Calculate gravitational force magnitude
        // F = G * (m1 * m2) / r^2
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
  };

  private updateTrails = (): void => {
    if (this.paused) return;

    // Update trail for each body
    this.bodies.forEach((body: Body) => {
      // Add current position to trail only if position has changed
      const lastPoint: { x: number; y: number } = body.trail[body.trail.length - 1];
      const currentPos: Matter.Vector = body.body.position;

      // Only add a point if it's sufficiently different from the last one
      const minDistance: number = 1; // Minimum distance to add a new point
      const dx: number = currentPos.x - lastPoint.x;
      const dy: number = currentPos.y - lastPoint.y;
      const distance: number = Math.sqrt(dx * dx + dy * dy);

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

  private handleCollision = (event: Matter.IEventCollision<Matter.Engine>): void => {
    const pairs = event.pairs;

    pairs.forEach((pair) => {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // Handle collision between bodies
      // You can add custom logic here, such as merging bodies or changing their properties
      console.log(`Collision detected between body ${bodyA.id} and body ${bodyB.id}`);
    });
  };

  // Start the physics runner
  public start(): void {
    Matter.Runner.run(this.runner, this.engine);
  }
}