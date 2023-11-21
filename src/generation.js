import { settings } from "./settings.js";
import { log, now } from "./utils.js";

export default class Generation {
    alive=[]; /* maybe I dont need this? or maybe I should do it like boolean arr?*/
    dead=[];
    SIZE;
    SIZEXSIZE;

    constructor(size, alive, dead) {
        this.SIZE = size
        this.SIZEXSIZE = this.SIZE*this.SIZE;
        if (alive && alive.length) {
            this.alive = alive;
        }
        if (dead && dead.length) {
            this.dead = dead;
        }
    }

    generateRandom(){
        const startTime = now();
        this.alive=[];
        this.dead=[];

        for (let i = 0; i < this.SIZEXSIZE; i++) {               
            if (Math.random() < settings.ALIVE_RANDOM_CHANCE) {
                this.alive.push(i);
            } else {
                this.dead.push(i);
            } 
        }
        const endTime = now();
        log(`Generating random ${this.SIZEXSIZE} statuses of life took ${endTime-startTime}ms.`);
    }

    addCell(index, isAlive){
        if (isAlive) {
            this.alive.push(index);
        } else {
            this.dead.push(index);
        }
    }
}