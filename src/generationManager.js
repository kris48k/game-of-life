import Generation from "./generation.js";
import {log as uiLog} from './utils.js';
const nextGenerationCalcWorker = new Worker("src/nextGenerationCalcWorker.js");


export default class GenerationManager extends EventTarget {
    currentGeneration;
    currentGenerationNumber;
    SIZE = 0;
    SIZEXSIZE=0;

    constructor(){
        super();
        this.currentGenerationNumber=0;
        nextGenerationCalcWorker.onmessage = this.onWorkerMessage.bind(this);
    }

    setSize(size){
        this.SIZE = size;
        this.SIZEXSIZE = size*size;
        this.currentGeneration = new Generation(this.SIZE);
    }

    generateFirst(size){
        this.setSize(size);
        this.currentGeneration.generateRandom();
    }

    makeNextGeneration(){
        nextGenerationCalcWorker.postMessage({
            _currentGeneration: this.currentGeneration.alive,
            _SIZE: this.SIZE,  
            _SIZEXSIZE: this.SIZEXSIZE
        });
    }

    onWorkerMessage(event){
        const {            
            log,
            nextDeadGenerations,
            nextAliveGenerations
        } = event.data;
        this.currentGeneration = new Generation(this.SIZE,nextAliveGenerations,  nextDeadGenerations);
        // todo push the hash here
        uiLog(log);
        this.dispatchEvent(new Event('new-generation'));
    }
}