const SPLASH_LIFETIME = 10;
const SPLASHES_COUNT = 5;

const RAINDROPS_COUNT = [100, 600, 1000, 4000];
const MAX_RAINDROP_DEPTH = 5;
const CRITICAL_RAINDROPS_COUNT = 5;

const UMBRELLA_RADIUS = 50;

class Raindrop{
    constructor(x, y, depth, speed){
        this.x = x;
        this.y = y;
        this.depth = depth;
        this.speed = speed;
        this.height = 20/this.depth;
    }

    update(){
        this.y += this.speed;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx){
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, 1, this.height);
    }
}

class Splash{
    constructor(x, y, angle){
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.lifetime = SPLASH_LIFETIME;
    }

    update(){
        this.x += Math.cos(this.angle);
        this.y -= Math.sin(this.angle);

        this.lifetime -= 1;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx){
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, 1, 1);
    }
}

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

        let dist = Math.sqrt( (this.x-raindrop.x)**2 + ((this.y-this.height)-(raindrop.y+raindrop.height))**2);

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

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * @param {number} maxWidth
 * @returns {Raindrop}
 */
function spawn(maxWidth){
    return new Raindrop(Math.random()*maxWidth, -30, getRandom(1, MAX_RAINDROP_DEPTH), getRandom(10, 20));
}

function splash(x, y){
    return new Splash(x, y, getRandom(Math.PI/4, Math.PI-Math.PI/4));
}


/**
 * 
 * @param {Raindrop[]} drops
 * @param {number} maxWidth
 * @param {number} rainLevel
 */
function initRain(drops, maxWidth, rainLevel){
    for(let i = drops.length; i < RAINDROPS_COUNT[rainLevel-1]; i++){
        drops.push(spawn(maxWidth));
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
    let drops = [];
    let splashes = [];
    let umbrella = new Umbrella(0, 0, UMBRELLA_RADIUS);

    let rainLevelSlider = document.getElementById('rain-slider');
    let rainLevel = rainLevelSlider.value;
    rainLevelSlider.addEventListener('change', e => {
        rainLevel = e.target.value;
        drops = [];
        initRain(drops, canvas.width, rainLevel);
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
        drops = drops.filter(e => e.y+e.height < ground_level_at(e.depth, canvas.height) && !umbrella.touched(e)/*canvas.height+e.depth*/);
    
        if(drops.length <= CRITICAL_RAINDROPS_COUNT){
            initRain(drops, canvas.width, rainLevel);
        }
        splashes = splashes.filter(e => e.lifetime > 0);
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        if(umbrella.isActive && umbrella.enabled){
            umbrella.render(ctx);
        }
    
        
        drops.forEach(e => {
            e.update();
    
            if(e.y+e.height > ground_level_at(e.depth, canvas.height) ||umbrella.touched(e)/*canvas.height*/){
                for(let i = 0; i < SPLASHES_COUNT; i++){
                    splashes.push(splash(e.x, e.y+e.height));
                }
                drops.push(spawn(canvas.width));
            }
    
            e.render(ctx);
        });
    
        splashes.forEach(e => {
            e.update();
            e.render(ctx);
        });
    
        requestAnimationFrame(loop);
    }

    initRain(drops, canvas.width, rainLevel);
    loop();
});