function now() {
    return new Date().getTime();
}

function log(message){
    const newElement = document.createElement('p');
    newElement.innerHTML = message;
    document.getElementById('logs').appendChild(newElement);
    //$logs.scrollTop = $logs.scrollHeight;
}

export {
    now, log
}