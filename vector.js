export class Vector2{

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    /**
     * 
     * @returns {number} The length of the vector
     */
    length(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    /**
     * 
     * @returns {Vector2} The normalized vector
     */
    normalized(){
        return new Vector2(this.x/this.length(), this.y/this.length());
    }

    /**
     * 
     * @param {Vector2} other
     * @returns {Vector2} The addition of two vectors
     */
    add(other){
        return new Vector2(this.x+other.x, this.y+other.y);
    }

    /**
     * 
     * @param {number} a 
     * @returns {Vector2} The product of a vector and a number
     */
    mul(a){
        return new Vector2(this.x*a, this.y*a);
    }
}