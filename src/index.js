import App from './app.js';

if (!window.Worker) {
    alert("Please choose the modern browser that support workers.");
}
  
document.addEventListener('DOMContentLoaded', function(){
    const app = new App();
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
