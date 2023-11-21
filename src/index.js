import App from './app.js';

if (!window.Worker) {
    alert("Please choose the modern browser that support workers.");
}
  
document.addEventListener('DOMContentLoaded', function(){
    new App();
});
