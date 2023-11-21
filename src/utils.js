import { settings } from "./settings.js";

function now() {
    return new Date().getTime();
}

function log(message){
    const newElement = document.createElement('p');
    newElement.innerHTML = message;
    document.getElementById('logs').appendChild(newElement);
    //$logs.scrollTop = $logs.scrollHeight;
}

/**
 * Separating in macro task several operations
 * @param {(index)=>void} fn - Function that would be called with some index argument
 * @param {number} length - max possible index that could be passed to fn
 */
function batchCycleOperation(fn, length, onBatchEnd) {
    for(let i = 0; i < length; i+=settings.BATCH_OPERATION_SIZE) {
        setTimeout((index)=>{
            const maxLength = Math.min(length, index+settings.BATCH_OPERATION_SIZE);
            for (let j = index; j<maxLength; j++) {
                fn.call(this, j);
            }
            if (length < index+settings.BATCH_OPERATION_SIZE) {
                onBatchEnd && onBatchEnd.call(this);
            }
        }, 0, i);
    }
}

export {
    now, log, batchCycleOperation
}