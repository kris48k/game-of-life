import { settings } from "./settings.js";

let $btnGenerateGrid;
let $btnGenerateRandom;
let $btnNextGeneration;
let $btnAutogenerate;

let $inputGridSize;
let $grid;
let $logs;
let $currentGeneration;

let SIZE;
let SIZEXSIZE;

let currentGeneration = [];


/* 
0 - beggining state
1 - picking first generaton
2 - choose next generation
3 - autogeneration
*/
let APP_STATE = 0; 



/* here we store all previous generations */
let generations = [];

let nextAliveGenerations = [];
let nextDeadGenerations = [];

const AUTOGENERATION_INTERVAL = 1000;
let AUTOGENERATION_INTERVAL_ID;

if (!window.Worker) {
    alert("Please choose the modern browser that support workers.");
}

const nextGenerationCalcWorker = new Worker("src/nextGenerationCalcWorker.js");

nextGenerationCalcWorker.onmessage = function(e) {
    const {            
        log,
        nextDeadGenerations,
        nextAliveGenerations
    } = e.data;
    const calcGenerationTime = new Date().getTime();
    generations.push(currentGeneration);
    currentGeneration = nextAliveGenerations;
    applyNewGeneration(nextAliveGenerations, nextDeadGenerations);
    const applyAlives = new Date().getTime();

    addLogs(log);
    addLogs(`Applying new generation time: ${applyAlives-calcGenerationTime}ms`);
    setTimeout(()=>{
        addLogs(`Painting time: ${new Date().getTime()-applyAlives}ms`);
        $currentGeneration.innerText = `#${generations.length}`;
    },0);

}
  
document.addEventListener('DOMContentLoaded', function(){
    $btnGenerateGrid = document.getElementById("btn-generate-grid");
    $btnGenerateGrid.addEventListener('click',onBtnGenerateGridClick);

    $btnGenerateRandom = document.getElementById("btn-generate-random");
    $btnGenerateRandom.addEventListener('click',onBtnGenerateRandomClick);

    $btnNextGeneration = document.getElementById("btn-next-generation");
    $btnNextGeneration.addEventListener('click', onBtnNextGenerationClick, false);
    
    $btnAutogenerate = document.getElementById('btn-autogenerate');
    $btnAutogenerate.addEventListener('click', onBtnAutoGenerateClick, false);
    
    $inputGridSize = document.getElementById("grid-size");

    $grid = document.getElementById("grid");
    $grid.addEventListener('click', onCellClick, false);
    $logs = document.getElementById("logs");

    $currentGeneration = document.getElementById('current-generation');
});

// TODO
function makeGenerationHash(generation) {
    const binnaryArray=Array.from({ length: SIZEXSIZE }).map((_,i)=> '0');
    for(let i =0; i < generation.length; i++) {
        binnaryArray[parseInt(generation[i])]='1';
    }
    const binaryString = binnaryArray.join('');
    const number = parseInt(binaryString, 2).toString(36);
    return number;
}

function makeNextGeneration(){
    /* it will be flashing otherwise */
    if (SIZE > 300) {
        $currentGeneration.innerText = `working on generation #${generations.length+1}`;
    }
    addLogs(`<b>Working on generation #${generations.length+1}</b>.`);
    nextGenerationCalcWorker.postMessage({
        _currentGeneration: currentGeneration,
        _SIZE: SIZE,  
        _SIZEXSIZE: SIZEXSIZE
    });
}

function onBtnNextGenerationClick(){
    APP_STATE = 2; 
    $btnGenerateRandom.disabled = true;

    makeNextGeneration();
}

function applyNewGeneration(nextAliveGenerations, nextDeadGenerations){
    for (let i = 0; i < nextAliveGenerations.length; i++) {
        makeAliveOrDead(nextAliveGenerations[i], true);
    }

    for (let i = 0; i < nextDeadGenerations.length; i++) {
        makeAliveOrDead(nextDeadGenerations[i], false);
    }
}

function onCellClick(e){
    if (APP_STATE !== 1) return; 

    const cell = e.target;
    const i = cell.dataset.index;
    const isAlive = cell.dataset.alive === "true";
    makeAliveOrDead(i, !isAlive, true);
}

function onBtnGenerateGridClick(){
    APP_STATE = 1;
    $btnGenerateGrid.disabled = true;
    $btnGenerateRandom.disabled = false;
    $btnNextGeneration.disabled = false;
    $btnAutogenerate.disabled = false;
    

    SIZE =  parseInt($inputGridSize.value);
    if (SIZE < 5) {
        alert("Grid size should be >= 5");
        return;
    } 
    SIZEXSIZE = SIZE*SIZE; 
    
    const gridWidth = (20+4)*SIZE;
    $grid.style.width = `${gridWidth}px`;
    
    createGrid($grid, SIZE);
}

function onBtnGenerateRandomClick(){
    const startTime = now();
    const chunks = 10000;
    currentGeneration = [];
    for (let i = 0; i < SIZEXSIZE; i+=chunks) {
        setTimeout((chunkStart)=>{
            const length = Math.min(chunkStart+chunks , SIZEXSIZE);
            for (let j = chunkStart; j < length; j++) {
                if (Math.random() < settings.ALIVE_RANDOM_CHANCE) {
                    makeAliveOrDead(j, true, true);
                } else {
                    makeAliveOrDead(j, false, true);
                }
            }
            if (length >= SIZEXSIZE-1) {
                const endTime = now();
                addLogs(`Calculating random alive tiles is done in ${endTime-startTime}ms.`);
            }
        }, 0, i);
       
    }
}

function onBtnAutoGenerateClick(){
    $btnGenerateRandom.disabled = true;

    if (APP_STATE === 3) {
        clearInterval(AUTOGENERATION_INTERVAL_ID);
        $btnAutogenerate.innerText = "Start Autogenerate";
        $btnNextGeneration.disabled = false;
        APP_STATE = 2;
        return;
    }

    APP_STATE = 3; 
    $btnAutogenerate.innerText = "Stop Autogenerate";
    $btnNextGeneration.disabled = true;
    AUTOGENERATION_INTERVAL_ID = setInterval(()=>{
        makeNextGeneration();
    }, AUTOGENERATION_INTERVAL);
}

/* For the first generation we need to push into currentGeneration */
function makeAliveOrDead(index, alive=true, pushToGeneration=false) {
    if (alive) {
        $grid.children[index].classList.add('alive');
        $grid.children[index].dataset.alive = true;
        pushToGeneration && currentGeneration.push(index);
    } else {
        $grid.children[index].classList.remove('alive');
        $grid.children[index].dataset.alive = false;
        if (pushToGeneration) {
            const genInd = currentGeneration.findIndex(e => e===index);
            genInd >= 0 && currentGeneration.splice(genInd, 1);
        }
    }
}

function createGrid($container) {
    const start = (new Date()).getTime();
    const buffer = [];
    for (let i = 0; i < SIZEXSIZE; i++) {
        buffer.push(cellTemplate(i));
    }
    const endOfBufferMaking = (new Date()).getTime();
    addLogs(`Constructed grid in ${endOfBufferMaking-start}ms.`);

    $container.innerHTML = buffer.join('');

    const endOfAddingToDom = (new Date()).getTime();
    addLogs(`Added grid to DOM in ${endOfAddingToDom-endOfBufferMaking}ms.`);

    setTimeout(()=>{
        const endOfLayout = (new Date()).getTime();
        addLogs(`Layout for constructing grid done in ${endOfLayout - endOfAddingToDom}ms.`);
    },0);
}


function cellTemplate(index) {
    return `<div data-index=${index}></div>`
}

function addLogs(message) {
    const newElement = document.createElement('p');
    newElement.innerHTML = message;
    $logs.appendChild(newElement);
    //$logs.scrollTop = $logs.scrollHeight;
}

function now() {
    return new Date().getTime();
}