let cellStatuses = [];
let currentGeneration = [];

let SIZE;
let SIZEXSIZE;
let AUTOGENERATION_INTERVAL;

onmessage = function(e){
    const {_SIZE, _SIZEXSIZE, _currentGeneration } = e.data;

    SIZE = _SIZE;
    SIZEXSIZE = _SIZEXSIZE;

    if (!currentGeneration || !currentGeneration.length) {
        currentGeneration = _currentGeneration;
    }
    
    if (!cellStatuses || !cellStatuses.length) {
        calcCellStatuses();
    }

    const {
        log,
        nextDeadGenerations,
        nextAliveGenerations
    } = makeNextGeneration();

    postMessage({
        log,
        nextDeadGenerations,
        nextAliveGenerations
    });

    // prepare for the next generation in background
    updateCellStatuses(nextAliveGenerations, nextDeadGenerations);
    currentGeneration = nextAliveGenerations;
}

function calcCellStatuses() {
    cellStatuses = Array.from({ length: SIZEXSIZE }).map((_,i)=> false);
    for (let i = 0; i < currentGeneration.length; i++) {
        cellStatuses[currentGeneration[i]] = true;
    }
}

function updateCellStatuses(nextAliveGenerations, nextDeadGenerations) {
    for (let i = 0; i < nextAliveGenerations.length; i++) {
        cellStatuses[nextAliveGenerations[i]] = true;
    }

    for (let i = 0; i < nextDeadGenerations.length; i++) {
        cellStatuses[nextDeadGenerations[i]] = false;
    }
}

function makeNextGeneration(){
    let log = "";
    const startTime = new Date().getTime();

    const checked=[];
    const checkStack = [];
    const nextAliveGenerations = [];
    const nextDeadGenerations=[];

    for (let i = 0; i < currentGeneration.length; i++) {
        const index = parseInt(currentGeneration[i]);
        checkStack.push(index);

        while (checkStack.length > 0) {
            const currentIndex = checkStack.pop();
            if (checked[currentIndex]) continue;
            checked[currentIndex] = true;
            
            const neighbourIndeces = getNeighboursIndeces(currentIndex);
            const willBeAliveOnNextGen = willBeAlive(cellStatuses[currentIndex], neighbourIndeces);

            if (willBeAliveOnNextGen) {
                nextAliveGenerations.push(currentIndex);
            } 
            
            /* if a cell is dead, and her neighours are dead, we don't need to check further */
            if (!cellStatuses[currentIndex] && !willBeAliveOnNextGen) {
                continue;
            }

            if (!willBeAliveOnNextGen) {
                nextDeadGenerations.push(currentIndex);
            }

            checkStack.push(...neighbourIndeces);
        }
    }
    const calcGenerationTime = new Date().getTime();
    log = `Generation making time: ${calcGenerationTime- startTime}ms`;
    return {
        log,
        nextDeadGenerations,
        nextAliveGenerations
    };
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

function willBeAlive(isAliveNow, neighbourIndeces){
    let aliveNeighbours = 0;
    for (let neighborIndex = 0; neighborIndex < neighbourIndeces.length; neighborIndex++) {
        
        if (cellStatuses[neighbourIndeces[neighborIndex]]) {
            aliveNeighbours++;
        }
        if (aliveNeighbours > 3) {
            break;
        }
    } 
    if (!isAliveNow && aliveNeighbours === 3) return true;
    if (isAliveNow && aliveNeighbours <=3 && aliveNeighbours>=2) return true;
    return false;
}

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