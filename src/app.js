import GenerationManager from "./generationManager.js";
import { batchCycleOperation, log, now } from "./utils.js";
import { settings } from "./settings.js";

export default class App {
    UIState = 0;
    SIZE = 0;
    SIZEXSIZE = 0;
    ui = {
        $btnGenerateGrid: null, 
        $btnGenerateRandom: null,
        $btnNextGeneration: null,
        $btnAutogenerate: null,
        $inputGridSize: null,
        $grid: null,
        $logs: null,
        $currentGenerationText: null
    };
    generationManager;
    AUTOGENERATION_INTERVAL_ID;

    constructor(){
        this.initUIElements();
        this.generationManager = new GenerationManager();
        this.generationManager.addEventListener('new-generation', this.applyGeneration.bind(this));
        this.generationManager.addEventListener('same-generation',this.onGenerationRepeated.bind(this));
        this.generationManager.addEventListener('extinct-generation', this.onExtinct.bind(this));
    }

    initUIElements(){
        this.ui.$btnGenerateGrid = document.getElementById("btn-generate-grid");
        this.ui.$btnGenerateGrid.addEventListener('click', this.onBtnGenerateGridClick.bind(this));
    
        this.ui.$btnGenerateRandom = document.getElementById("btn-generate-random");
        this.ui.$btnGenerateRandom.addEventListener('click', this.onBtnGenerateRandomClick.bind(this));
    
        this.ui.$btnNextGeneration = document.getElementById("btn-next-generation");
        this.ui.$btnNextGeneration.addEventListener('click', this.onBtnNextGenerationClick.bind(this), false);
        
        this.ui.$btnAutogenerate = document.getElementById('btn-autogenerate');
        this.ui.$btnAutogenerate.addEventListener('click', this.onBtnAutoGenerateClick.bind(this), false);
        
        this.ui.$inputGridSize = document.getElementById("grid-size");
    
        this.ui.$grid = document.getElementById("grid");
        this.ui.$grid.addEventListener('click', this.onCellClick.bind(this), false);
        
        this.ui.$currentGenerationText = document.getElementById('current-generation');
    }

    onBtnNextGenerationClick(){
        this.setUIState(2);
        this.makeNextGeneration();
    }

    onBtnGenerateGridClick() {
        this.setUIState(0.5);
        setTimeout(()=> {
            this.createGrid();
            this.setUIState(1);
            this.generationManager.setSize(this.SIZE);
        }, 0);
    }

    onBtnAutoGenerateClick(){
        if (this.UIState === 3) {
            clearInterval(this.AUTOGENERATION_INTERVAL_ID);
            this.setUIState(2);
        } else {
            this.setUIState(3);
            this.AUTOGENERATION_INTERVAL_ID = setInterval(()=>{
                this.makeNextGeneration();
            }, settings.AUTOGENERATION_INTERVAL);
        }
    }

    onBtnGenerateRandomClick(){
        this.setUIState(1.5)
        this.generationManager.generateFirst(this.SIZE);
        this.clearGrid();
        this.applyGeneration();
        setTimeout(()=>{
            this.setUIState(1);
        }, 0)
    }

    createGrid(){

        this.SIZE =  parseInt(this.ui.$inputGridSize.value);
        if (this.SIZE < 5) {
            alert("Grid size should be >= 5");
            return;
        } 
        this.SIZEXSIZE = this.SIZE*this.SIZE; 
        if (this.SIZE >= 800) {
            settings.AUTOGENERATION_INTERVAL *= this.SIZE/500;
        }
        
        const gridWidth = (20+2+2)*this.SIZE; // 20 is the width of the cell + 2+2 margins
        this.ui.$grid.style.width = `${gridWidth}px`;

        const startTime = now();
        const buffer = [];
        for (let i = 0; i < this.SIZEXSIZE; i++) {
            buffer.push(`<div data-index=${i}></div>`);
        }
        const endOfBufferMakingTime = now();
        log(`Constructed grid in ${endOfBufferMakingTime-startTime}ms.`);
    
        this.ui.$grid.innerHTML = buffer.join('');
    
        const endOfAddingToDomTime = now();
        log(`Added grid to DOM in ${endOfAddingToDomTime-endOfBufferMakingTime}ms.`);
    
        setTimeout(()=>{
            const endOfLayoutTime = now();
            log(`Layout for constructing grid done in ${endOfLayoutTime - endOfAddingToDomTime}ms.`);
        },0);
    }

    onExtinct(){
        this.setUIState(4);
        this.endGame();
        log(`<b>Game Over! The last generation fully extinct</b>`);
    }

    onGenerationRepeated(e){
        this.setUIState(4);
        this.endGame();
        log(`<b>Game Over! The last generation is the same as generation #${e.detail}</b>`);
    }

    /* 
        0 - beggining state
        0.5 - long grid generating state
        1 - picking first generaton
        1.5 - long random generation
        2 - choose next generation
        3 - autogeneration
        4 - finish
    */
    setUIState(newUIState){
        this.UIState = newUIState;
        switch (newUIState) {
            case 0.5: {
                this.ui.$btnGenerateGrid.disabled = true;
                this.ui.$currentGenerationText.innerText = "generating grid ...";
                break;
            }
            case 1: {
                this.ui.$btnGenerateGrid.disabled = true;
                this.ui.$btnGenerateRandom.disabled = false;
                this.ui.$btnNextGeneration.disabled = false;
                this.ui.$btnAutogenerate.disabled = false;
                this.ui.$currentGenerationText.innerText = "";
                break;
            }
            case 1.5: {
                this.ui.$btnGenerateRandom.disabled = true;
                break;
            }
            case 2: {
                this.ui.$btnGenerateRandom.disabled = true;
                this.ui.$btnAutogenerate.innerText = "Start Autogenerate";
                this.ui.$btnNextGeneration.disabled = false;
                break;
            }
            case 3: {
                this.ui.$btnGenerateRandom.disabled = true;
                this.ui.$btnAutogenerate.innerText = "Stop Autogenerate";
                this.ui.$btnNextGeneration.disabled = true;
                break;
            }
            case 4: {
                this.ui.$btnGenerateGrid.disabled = true;
                this.ui.$btnGenerateRandom.disabled = true;
                this.ui.$btnNextGeneration.disabled = true;
                this.ui.$btnAutogenerate.disabled = true;
                break;
            }
        }
    }

    onCellClick(e){
        if (this.UIState !== 1) return; 
    
        const cell = e.target;
        const i = cell.dataset.index;
        const isAlive = cell.dataset.alive === "true";
        this.generationManager.currentGeneration.addCell(i, !isAlive);
        this.makeAliveOrDead(i, !isAlive, true);
    }

    clearGrid(){
        for (let i = 0; i < this.SIZEXSIZE; i++) {
            this.makeAliveOrDead(i, false);
        }
    }

    makeNextGeneration(){
        this.ui.$currentGenerationText.innerText = `${this.generationManager.currentGenerationNumber+1}...`;
        log(`<b>Working on generation #${this.generationManager.currentGenerationNumber+1}.</b>`);
        this.generationManager.makeNextGeneration();
    }

    applyGeneration(){
        const start = now();

        const newAlive = this.generationManager.currentGeneration.alive;
        const newDead = this.generationManager.currentGeneration.dead;
        for (let i = 0; i < newAlive.length; i++) {
            this.makeAliveOrDead(newAlive[i], true);
        }
    
        for (let i = 0; i < newDead.length; i++) {
            this.makeAliveOrDead(newDead[i], false);
        }

        const applicationTime = now();
        log(`Applied new generation in ${applicationTime-start}ms.`);
        setTimeout(()=>{
            const paintedTime = now();
            log(`Painted new generation in ${paintedTime-applicationTime}ms.`);
            this.ui.$currentGenerationText.innerText = `${this.generationManager.currentGenerationNumber}`;
        }, 0);
    }

    // Not used. Leaving it here as an alternative way. 
    // For some reason batch application and painting works for 30% slower.
    // But smoother and doesn't cloge the main thread.
    applyGenerationBatched(){
        const startTime = now();

        const newAlive = this.generationManager.currentGeneration.alive;
        const newDead = this.generationManager.currentGeneration.dead;

        batchCycleOperation((index)=>{
            this.makeAliveOrDead(newDead[index], false);
        }, newDead.length);
        
        batchCycleOperation((index)=>{
            this.makeAliveOrDead(newAlive[index], true);
        }, newAlive.length, ()=>{
            const endTime = now();
            log(`Generation applied and painted in ${endTime-startTime}ms`);
        });
    }

    makeAliveOrDead(index, alive=true) {
        if (alive) {
            this.ui.$grid.children[index].classList.add('alive');
            this.ui.$grid.children[index].dataset.alive = true;
        } else {
            this.ui.$grid.children[index].classList.remove('alive');
            this.ui.$grid.children[index].dataset.alive = false;
        }
    }

    endGame(){
        clearInterval(this.AUTOGENERATION_INTERVAL_ID);
    }
}