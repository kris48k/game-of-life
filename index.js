let $btnGenerateGrid;
let $inputGridSize;
let $btn1stgeneration;
let $btnStart;
let $grid;
let $logs;

let SIZE;
let SIZEXSIZE;
let isManualPickMode = true;
let isGenerating = false;

const ALIVE_RANDOM_CHANCE = 0.3;

let currentGeneration = [];

const timers={
    FIRST_RANDOM_GENERATION_START: 0,
    FIRST_RANDOM_GENERATION_END: 0,
};


/* here we store all previous generations */
let generations = [];

let nextAliveGenerations = [];
let nextDeadGenerations = [];

const NEXT_GENERATION_TIMEOUT = 1000;

if (!window.Worker) {
    alert("Please choose the modern browser that support workers.");
}

const nextGenerationCalcWorker = new Worker("nextGenerationCalcWorker.js");

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
    },0);

}
  
document.addEventListener('DOMContentLoaded', function(){
    $btnGenerateGrid = document.getElementById("btn-generate-grid");
    $inputGridSize = document.getElementById("grid-size");
    $btn1stgeneration = document.getElementById("first-generaton");

    $grid = document.getElementById("grid");
    $btnStart = document.getElementById("start");
    $logs = document.getElementById("logs");

    $btnGenerateGrid.addEventListener('click',onBtnGenerateGridClick);
    $btn1stgeneration.addEventListener('click',onBtnFirstGenerationClick);
    $grid.addEventListener('click', onCellClick, false);
    $btnStart.addEventListener('click', onStartClick, false);
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


function getCurrentStatus(index) {
    return $grid.children[index].dataset.alive === "true";
}

function onStartClick(){
    nextGenerationCalcWorker.postMessage({
        _currentGeneration: currentGeneration,
        _SIZE: SIZE,  
        _SIZEXSIZE: SIZEXSIZE
    });
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
    if (!isManualPickMode) return;

    const cell = e.target;
    const i = cell.dataset.index;
    const isAlive = cell.dataset.alive === "true";
    makeAliveOrDead(i, !isAlive, true);
}

function onBtnGenerateGridClick(){
    isManualPickMode = true;
    SIZE =  parseInt($inputGridSize.value);
    if (SIZE < 5) {
        alert("Grid size should be >= 5");
        return;
    } 
    SIZEXSIZE = SIZE*SIZE; 
    
    const gridWidth = (20+4)*SIZE;
    $grid.style.width = `${gridWidth}px`;

    currentGenerationFull = new Array({ length: SIZEXSIZE }).map(_=>false);
    
    createGrid($grid, SIZE);
}

function onBtnFirstGenerationClick(){
    const startTime = now();
    const chunks = 10000;
    currentGeneration = [];
    for (let i = 0; i < SIZEXSIZE; i+=chunks) {
        setTimeout((chunkStart)=>{
            console.log(
                "in setTimeout", chunkStart
            );
            const length = Math.min(chunkStart+chunks , SIZEXSIZE);
            for (let j = chunkStart; j < length; j++) {
                if (Math.random() < ALIVE_RANDOM_CHANCE) {
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
    newElement.innerText = message;
    $logs.appendChild(newElement);
}

function now() {
    return new Date().getTime();
}