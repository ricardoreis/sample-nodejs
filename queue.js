//queue.js

/* Implementing a JavaScript queue using an array
*  English      > https://www.javascripttutorial.net/javascript-queue/
*  Portugues    > https://medium.com/@ricardoreis_22930/queue-fila-9a7cf32c1132
*/

function Queue(){
    this.elements = [];
}

// enqueue method adds an element at the end of the queue 
Queue.prototype.enqueue = function (e) {
    // insert the new element 
    this.elements.push(e);
}

// remove an element from the front of the queue
Queue.prototype.dequeue = function () {
    return this.elements.shift();
}

// check if the queue is empty
Queue.prototype.isEmpty = function () {
    return this.elements.length == 0;
}

// get the element at the front of the queue
Queue.prototype.peek = function () {
    return !this.isEmpty() ? this.elements[0] : undefined;
}

// to query the length of a queue
Queue.prototype.length = function () {
    return this.elements.length;
}

// Exporta a classe Queue para uso externo
export default Queue;