import { getRandom } from "./math.js";
import { Vector2 } from "./vector.js";


export class Particle{
    /**
     * 
     * @param {Vector2} position the position of the Particle
     * @param {number} depth A virtual z component 
     * @param {Vector2} velocity The velocity of the particle
     * @param {number} maxLifetime Maximul lifetime of a particle
     */
    constructor(position, depth, velocity, maxLifetime){
        this.position = position;
        this.depth = depth;
        this.velocity = velocity;
        this.isDead = false;
        this.maxLifetime = maxLifetime;
        this.lifetime = 0;

    }


    /**
     * 
     * @param {(e:Particle) => void} onUpdate 
     */
    update(onUpdate){
        if(! (this instanceof Raindrop)){
            this.lifetime++;
            if(this.lifetime >= this.maxLifetime){
                this.isDead = true;
            }
        }

        onUpdate(this);

        this.position = this.position.add(this.velocity);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx){

    }
}

export class Raindrop extends Particle{

    /**
     * 
     * @param {Vector2} position the position of the Particle
     * @param {number} depth A virtual z component 
     * @param {Vector2} velocity The velocity of the particle
     */
    constructor(position, depth, velocity){
        super(position, depth, velocity, -1);
        this.height = 20/this.depth;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx){
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, 1, this.height);
    }

}

export class Splash extends Particle{
    /**
     * 
     * @param {Vector2} position the position of the Particle
     * @param {number} maxLifetime Maximul lifetime of a particle
     */
    constructor(position, maxLifetime){
        let angle = getRandom(Math.PI/4, Math.PI+Math.PI/4);
        let dir = new Vector2(Math.cos(angle), -Math.sin(angle));
        super(position, 0, dir, maxLifetime);

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx){
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, 1, 1);
    }
}


export class ParticleSystem{

    constructor(){
        this.particles = [];
    }

    /**
     * Clears all particles
     */
    clear(){
        this.particles = [];
    }


    clearDeadParticles(){
        this.particles = this.particles.filter(e => !e.isDead);
    }

    /**
     * Update all particles
     * @param {(e:Particle) => void} onUpdate 
     */
    update(onUpdate){
        this.particles.forEach(e => {
            e.update(onUpdate);
        });
    }

    /**
     * Render all particles
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx){
        this.particles.forEach(e => {
            e.render(ctx);
        });
    }

    /**
     * Spawn a raindrop along a line
     * @param {Vector2} origin Origin of the segment
     * @param {number} width Width of the segment
     */
    spawnRaindropAlong(origin, width, depth){
        let offset = new Vector2(Math.random()*width, 0);
        let velocity = new Vector2(0, getRandom(10, 20));
        let raindrop = new Raindrop(origin.add(offset), depth, velocity);

        this.particles.push(raindrop);
    }

    /**
     * Spawn a splash particles
     * 
     * @param {Vector2} origin Origin of the arc
     * @param {number} lifetime life time of the particles
     */
    spawnSplashAt(origin, lifetime){

        let splash = new Splash(origin, lifetime);
        this.particles.push(splash);
    }

}

