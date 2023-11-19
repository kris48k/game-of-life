let $btnGenerateGrid;
let $inputGridSize;

let $btn1stgeneration;
let $btnStart;
let $grid;
let SIZE;
let SIZEXSIZE;
let isManualPickMode = true;
let isGenerating = false;

const ALIVE_RANDOM_CHANCE = 0.3;

let currentGeneration = [];
let generations = [];

let nextAliveGenerations = [];
let nextDeadGenerations = [];

document.addEventListener('DOMContentLoaded', function(){
    $btnGenerateGrid = document.getElementById("btn-generate-grid");
    $inputGridSize = document.getElementById("grid-size");
    $btn1stgeneration = document.getElementById("first-generaton");

    $grid = document.getElementById("grid");
    $btnStart = document.getElementById("start");

    $btnGenerateGrid.addEventListener('click',onBtnGenerateGridClick);
    $btn1stgeneration.addEventListener('click',onBtnFirstGenerationClick);
    $grid.addEventListener('click', onCellClick, false);
    $btnStart.addEventListener('click', onStartClick, false);
});

function getCoordinates(index) {
    return [index%SIZE, Math.floor(index/SIZE)];
}

function getIndex(x,y) {
    let tX=x, tY=y, tInd;

    if (x<0) tX = SIZE+x;
    if (x>=SIZE) tX = x-SIZE;

    if (y<0) tY = SIZE+y;
    if (y>=SIZE) tY = y-SIZE;

    tInd = tY*SIZE+tX;
    return tInd;
}

function getNeighboursIndeces(index) {
    const [x,y] = getCoordinates(index);
    return [
        [x-1,   y],
        [x-1,   y+1],
        [x-1,   y-1],
        [x,     y-1],
        [x,     y+1],
        [x+1,   y-1],
        [x+1,   y],
        [x+1,   y+1]
    ].map(([x,y]) => getIndex(x,y));
}

function makeNewGeneration(){

}

function willBeAlive(neighbourIndeces){
    let aliveNeighbours = 0;
    for (let neighborIndex = 0; neighborIndex < neighbourIndeces.length; neighborIndex++) {
        
        if (getCurrentStatus(neighbourIndeces[neighborIndex])) {
            aliveNeighbours++;
        }
        if (aliveNeighbours >= 3) {
            return true;
        }
    }
    return false;
}


function getCurrentStatus(index) {
    return $grid.children[index].dataset.alive === "true";
}


function onStartClick(){
    isManualPickMode = false;
    isGenerating = true;

    const checked=[];
    const checkStack = [];
    nextAliveGenerations = [];
    nextDeadGenerations=[];

    for (let i = 0; i < currentGeneration.length; i++) {
        console.log(i, currentGeneration[i]);
        const index = parseInt(currentGeneration[i]);
        checkStack.push(index);

        while (checkStack.length > 0) {
            const currentIndex = checkStack.pop();
            if (checked[currentIndex]) continue;

            const neighbourIndeces = getNeighboursIndeces(currentIndex);
            const willBeAliveOnNextGen = willBeAlive(neighbourIndeces);

            // state alive doesnt change in new generation for the cell
            if (getCurrentStatus(currentIndex) === willBeAliveOnNextGen) {
                continue;
            }

            if (willBeAliveOnNextGen) {
                nextAliveGenerations.push(currentIndex);

            } else {
                nextDeadGenerations.push(currentIndex);
            }
            

            checked[currentIndex] = true;
            checkStack.push(...neighbourIndeces);
        }
    }
    console.log("nextAliveGenerations", nextAliveGenerations);
    generations.push(currentGeneration);
    currentGeneration = nextAliveGenerations;
    applyNewGeneration(nextAliveGenerations, nextDeadGenerations);
}

function applyNewGeneration(nextAliveGenerations, nextDeadGenerations){
    for (let i = 0; i < nextAliveGenerations.length; i++) {
        makeAliveOrDead(nextAliveGenerations[i], true, false);
    }

    for (let i = 0; i < nextDeadGenerations.length; i++) {
        makeAliveOrDead(nextDeadGenerations[i], false, false);
    }

}

function onCellClick(e){
    if (!isManualPickMode) return;

    const cell = e.target;
    const i = cell.dataset.index;
    const isAlive = cell.dataset.alive === "true";
    makeAliveOrDead(i, isAlive);
}

function onBtnGenerateGridClick(){
    SIZE =  parseInt($inputGridSize.value);
    SIZEXSIZE = SIZE*SIZE; 
    $grid.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
    $grid.style.gridTemplateRows = `repeat(${SIZE}, 1fr)`;
    
    const gridWidth = (20+6)*SIZE;
    $grid.style.width = `${gridWidth}px`;
    
    createGrid($grid, SIZE);
}

function onBtnFirstGenerationClick(){
    currentGeneration = [];
    for (let i = 0; i < SIZEXSIZE; i++) {
        if (Math.random() < ALIVE_RANDOM_CHANCE) {
            makeAliveOrDead(i, true);
        } else {
            makeAliveOrDead(i, false);
        }
    }
}

function makeAliveOrDead(index, alive=true, pushToGeneration=true) {
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

function createGrid($container, size) {
    const b = (new Date()).getTime();
    console.log("before:createGrid", (new Date()).getTime());
    const buffer = [];
    for (let i = 0; i < SIZEXSIZE; i++) {
        //const el = document.createElement('div');
        //el.dataset.index = i;
        //$container.appendChild(el);
        buffer.push(cellTemplate(i));
    }
    const t =  (new Date()).getTime();
    console.log("before:innerHTML:createGrid", t, t-b);
    $container.innerHTML = buffer.join('');
    console.log("after:innerHTML:createGrid", (new Date()).getTime(), (new Date()).getTime()-t);
}

function createGridWithElements($container, size) {
    const b = (new Date()).getTime();
    console.log("before:createGrid", (new Date()).getTime());
    const buffer = [];
    for (let i = 0; i < SIZEXSIZE; i++) {
        const el = document.createElement('div');
        el.dataset.index = i;
        $container.appendChild(el);
       
    }
    const t =  (new Date()).getTime();
    console.log("before:innerHTML:createGrid", t, t-b);
    console.log("after:innerHTML:createGrid", (new Date()).getTime(), (new Date()).getTime()-t);
}


function createGridWithFragment($container, size) {
    const b = (new Date()).getTime();
    console.log("before:createGrid", (new Date()).getTime());
    const buffer = [];
    const fragment = new DocumentFragment();
    for (let i = 0; i < SIZEXSIZE; i++) {
        const el = document.createElement('div');
        el.dataset.index = i;
        fragment.appendChild(el);
        //$container.appendChild(el);
        //buffer.push(cellTemplate(i));
    }
    const t =  (new Date()).getTime();
    console.log("before:innerHTML:createGrid", t, t-b);
    //$container.innerHTML = buffer.join('');
    $container.append(fragment);
    console.log("after:innerHTML:createGrid", (new Date()).getTime(), (new Date()).getTime()-t);
}

function cellTemplate(index) {
    return `<div data-index=${index}></div>`
}

