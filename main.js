import { ParticleSystem, Particle, Raindrop } from "./particles.js";
import { getRandom } from "./math.js";
import { Vector2 } from "./vector.js";

const SPLASH_LIFETIME = 10;
const SPLASHES_COUNT = 5;

const RAINDROPS_COUNT = [100, 500, 2000];
const MAX_RAINDROP_DEPTH = 5;

const UMBRELLA_RADIUS = 50;


class Umbrella{
    constructor(x, y, radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.height = radius;
        this.isActive = true;
        this.enabled = true;
    }

    /**
     * 
     * @param {Raindrop} raindrop 
     */
    touched(raindrop){

        if(!this.isActive || !this.enabled){
            return false;
        }

        let dist = Math.sqrt( (this.x-raindrop.position.x)**2 + ((this.y-this.height)-(raindrop.position.y+raindrop.height))**2);

        return dist <= this.radius;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx){
        ctx.fillStyle = 'black';

        ctx.strokeStyle = 'black'
        // Manche du parapluie
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y-this.height);
        ctx.closePath();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(this.x-5, this.y-5/2, 5, 0, Math.PI);
        ctx.stroke();


        ctx.beginPath();
        ctx.arc(this.x, this.y-this.height, this.radius, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();

    }
}



/**
 * 
 * @param {ParticleSystem} system
 * @param {number} maxWidth
 * @param {number} rainLevel
 */
function initRain(system, maxWidth, rainLevel){
    for(let i = system.particles.length; i < RAINDROPS_COUNT[rainLevel-1]; i++){
        let depth = getRandom(1, MAX_RAINDROP_DEPTH);
        system.spawnRaindropAlong(new Vector2(0, -30), maxWidth, depth);
    }
}

/**
 * 
 * @param {number} depth 
 * @param {number} canvasHeight 
 * @returns {number}
 */
function ground_level_at(depth, canvasHeight){
    if(1 <= depth && depth < 2.5){
        return canvasHeight
    }

    if(2.5 <= depth && depth < 3.5){
        return canvasHeight-20;
    }

    return canvasHeight-40;
}




document.addEventListener('DOMContentLoaded', e => {
    let canvas = document.querySelector('canvas');

    canvas.width = window.screen.width;
    canvas.height = window.screen.height / 1.5;

    let ctx = canvas.getContext('2d');
    let umbrella = new Umbrella(0, 0, UMBRELLA_RADIUS);
    let system = new ParticleSystem();

    let rainLevelSlider = document.getElementById('rain-slider');
    let rainLevel = rainLevelSlider.value;
    rainLevelSlider.addEventListener('change', e => {
        rainLevel = e.target.value;
        system.clear();
        initRain(system, canvas.width, rainLevel);
    });

    let umbrellaToggle = document.getElementById('umbrella-toggle');
    umbrella.enabled = umbrellaToggle.checked;
    umbrellaToggle.addEventListener('change', e => {
        umbrella.enabled = e.target.checked;
    });

    
    canvas.addEventListener('mousemove', e => {
        umbrella.x = e.x;
        umbrella.y = e.y;
    });
    
    canvas.addEventListener('mouseenter', e => {
        umbrella.isActive = true;
    });
    
    canvas.addEventListener('mouseleave', e => {
        umbrella.isActive = false;
    });


    function loop(){
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        if(umbrella.isActive && umbrella.enabled){
            umbrella.render(ctx);
        }

        system.clearDeadParticles();

        system.update(particle => {
            if(particle instanceof Raindrop){
                if( umbrella.touched(particle) || particle.position.y+particle.height >= ground_level_at(particle.depth, canvas.height)){
                    particle.isDead = true;
                    for(let i = 0; i < SPLASHES_COUNT; i++){
                        system.spawnSplashAt(particle.position, SPLASH_LIFETIME);
                    }

                    system.spawnRaindropAlong(new Vector2(0, -30), canvas.width, getRandom(1, MAX_RAINDROP_DEPTH));
                }
            }
        });

        system.render(ctx);
        
    
        requestAnimationFrame(loop);
    }

    initRain(system, canvas.width, rainLevel);
    loop();
});