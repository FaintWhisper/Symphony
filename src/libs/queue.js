class Queue {
    constructor([...initialQueue]) {
        this._queue = initialQueue;
    }

    enqueue(element) {
        this._queue.push(element);
    }

    dequeue() {
        return this._queue.splice(0, 1)[0];
    }

    insert(element, position) {
        this._queue.splice(position, 0, element);
    }

    get(index) {
        return this._queue[index];
    }

    size() {
        return this._queue.length;
    }
}

module.exports = Queue;