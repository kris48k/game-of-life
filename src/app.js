import GenerationManager from "./generationManager.js";
import { log, now } from "./utils.js";
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
    
        this.generationManager.makeNextGeneration();
    }

    onBtnGenerateGridClick() {
        this.setUIState(1);
        this.createGrid();
        this.generationManager.setSize(this.SIZE);
    }

    onBtnAutoGenerateClick(){
        if (this.UIState === 3) {
            clearInterval(this.AUTOGENERATION_INTERVAL_ID);
            this.setUIState(2);
        } else {
            this.setUIState(3);
            this.AUTOGENERATION_INTERVAL_ID = setInterval(()=>{
                this.generationManager.makeNextGeneration();
            }, settings.AUTOGENERATION_INTERVAL);
        }
    }

    onBtnGenerateRandomClick(){
        this.generationManager.generateFirst(this.SIZE);
        this.clearGrid();
        this.applyGeneration();
    }

    // TODO BAtching?
    createGrid(){
        this.SIZE =  parseInt(this.ui.$inputGridSize.value);
        if (this.SIZE < 5) {
            alert("Grid size should be >= 5");
            return;
        } 
        this.SIZEXSIZE = this.SIZE*this.SIZE; 
        
        const gridWidth = (20+2+2)*this.SIZE; // 20 is the width of the cell + 2+2 margins
        this.ui.$grid.style.width = `${gridWidth}px`;

        const start = now();
        const buffer = [];
        for (let i = 0; i < this.SIZEXSIZE; i++) {
            buffer.push(`<div data-index=${i}></div>`);
        }
        const endOfBufferMaking = now();
        log(`Constructed grid in ${endOfBufferMaking-start}ms.`);
    
        this.ui.$grid.innerHTML = buffer.join('');
    
        const endOfAddingToDom = now();
        log(`Added grid to DOM in ${endOfAddingToDom-endOfBufferMaking}ms.`);
    
        setTimeout(()=>{
            const endOfLayout = now();
            log(`Layout for constructing grid done in ${endOfLayout - endOfAddingToDom}ms.`);
        },0);
    }

    /* 
        0 - beggining state
        1 - picking first generaton
        2 - choose next generation
        3 - autogeneration
    */
    setUIState(newUIState){
        this.UIState = newUIState;
        switch (newUIState) {
            case 1: {
                this.ui.$btnGenerateGrid.disabled = true;
                this.ui.$btnGenerateRandom.disabled = false;
                this.ui.$btnNextGeneration.disabled = false;
                this.ui.$btnAutogenerate.disabled = false;
                break;
            }
            case 3: {
                this.ui.$btnGenerateRandom.disabled = true;
                this.ui.$btnAutogenerate.innerText = "Stop Autogenerate";
                this.ui.$btnNextGeneration.disabled = true;
            }
            case 2: {
                this.ui.$btnGenerateRandom.disabled = true;
                this.ui.$btnAutogenerate.innerText = "Start Autogenerate";
                this.ui.$btnNextGeneration.disabled = false;
            }
        }
    }

    addLogs(message) {
        const newElement = document.createElement('p');
        newElement.innerHTML = message;
        $logs.appendChild(newElement);
    }

    onCellClick(e){
        if (this.UIState !== 1) return; 
    
        const cell = e.target;
        const i = cell.dataset.index;
        const isAlive = cell.dataset.alive === "true";
        this.generationManager.currentGeneration.addCell(i, !isAlive);
        this.makeAliveOrDead(i, !isAlive, true);
    }

    // TODO batching
    clearGrid(){
        for (let i = 0; i < this.SIZEXSIZE; i++) {
            this.makeAliveOrDead(i, false);
        }
    }

    applyGeneration(){
        const newAlive = this.generationManager.currentGeneration.alive;
        const newDead = this.generationManager.currentGeneration.dead;
        debugger;
        for (let i = 0; i < newAlive.length; i++) {
            this.makeAliveOrDead(newAlive[i], true);
        }
    
        for (let i = 0; i < newDead.length; i++) {
            this.makeAliveOrDead(newDead[i], false);
        }
    }

    // TODO
    applyGenerationBathced(){
        this.batchOperation((index)=>{
            this.makeAliveOrDead(this.newAlive[index], true);
        }, this.newAlive.length);

        this.batchOperation((index)=>{
            this.makeAliveOrDead(this.newDead[index], false);
        }, this.newDead.length);
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
}