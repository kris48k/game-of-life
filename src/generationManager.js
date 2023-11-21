import Generation from "./generation.js";
import {log as uiLog} from './utils.js';
const nextGenerationCalcWorker = new Worker("src/nextGenerationCalcWorker.js");


export default class GenerationManager extends EventTarget {
    currentGeneration;
    currentGenerationNumber;
    SIZE = 0;
    SIZEXSIZE=0;
    generationHashes={};

    constructor(){
        super();
        this.currentGenerationNumber=0;
        nextGenerationCalcWorker.onmessage = this.onWorkerMessage.bind(this);
    }

    setSize(size){
        this.SIZE = size;
        this.SIZEXSIZE = size*size;
        this.currentGeneration = new Generation(this.SIZE);
        this.currentGenerationNumber=1;
    }

    generateFirst(size){
        this.setSize(size);
        this.currentGeneration.generateRandom();
        this.currentGenerationNumber=1;
    }

    makeNextGeneration(){
        nextGenerationCalcWorker.postMessage({
            _currentGeneration: this.currentGeneration.alive,
            _SIZE: this.SIZE,  
            _SIZEXSIZE: this.SIZEXSIZE
        });
    }

    checkOnExtinction(nextAliveGenerations){
        if (nextAliveGenerations.length === 0) {
            this.dispatchEvent(new CustomEvent('extinct-generation'));
        }
    }

    checkOnCycle(hash){
        if (!this.generationHashes[hash]) {
            this.generationHashes[hash] = this.currentGenerationNumber;
        } else {
            this.dispatchEvent(new CustomEvent('same-generation', {detail: this.generationHashes[hash]}));
        }
    }

    onWorkerMessage(event){
        const {            
            log,
            nextDeadGenerations,
            nextAliveGenerations,
            hash
        } = event.data;
        this.currentGeneration = new Generation(this.SIZE,nextAliveGenerations,  nextDeadGenerations);
        uiLog(log);
        this.dispatchEvent(new CustomEvent('new-generation'));

        this.currentGenerationNumber++;
        
        this.checkOnExtinction(nextAliveGenerations);
        this.checkOnCycle(hash);
    }
}