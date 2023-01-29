function testPriorityQueue() {
  console.log("Testing PriorityQueue...");

  var myHeap = new PriorityQueue([1, 2, 3], (a, b) => { return a > b; });

  console.log(myHeap.toString());
  myHeap.push(4);
  myHeap.push(7);
  console.log(myHeap.toString());
  myHeap.push(7);
  myHeap.push(7);
  myHeap.push(7);
  myHeap.push(19);
  console.log(myHeap.toString());
  console.log("pop: " + myHeap.pop());
  console.log("pop: " + myHeap.pop());
  console.log("pop: " + myHeap.pop());
  console.log("pop: " + myHeap.pop());
  console.log(myHeap.toString());
  console.log("length: " + myHeap.getSize());
  console.log("pop: " + myHeap.pop());
  console.log("isEmpty: " + myHeap.isEmpty());
  console.log("pop: " + myHeap.pop());
  console.log(myHeap.toString());
  console.log("pop: " + myHeap.pop());
  console.log(myHeap.toString());
  console.log("isEmpty: " + myHeap.isEmpty());
  console.log("pop: " + myHeap.pop());
  console.log(myHeap.toString());
  console.log("pop: " + myHeap.pop());
  console.log(myHeap.toString());
  console.log("isEmpty: " + myHeap.isEmpty());

}

class PriorityQueue {
  /**
   *  Array : [a][b][c][d][e][f][g][h][i][ ][ ]... 
   *
   *  Heap :        a
   *              /   \
   *             b     c    2  3  10      11
   *            /\     /\
   *           d  e   f  g 45 67  100 101  110 111
   *          /\
   *         h  i
   */
  constructor(arr = [], compF) {
    this.arr = [];
    this.compFunct = compF; // returns true if the first should be in the front IDK IF THIS IS STANDARD
    arr.forEach((obj) => { this.push(obj) });
  }
  pop() {
    if (this.arr.length == 0) throw new Error("Priority Queue: cannot pop element from empty heap");
    if (this.arr.length == 1) return this.arr.pop();

    var rtrn = this.arr[0];

    var focusIndx = 0;
    var parent = this.arr.pop();

    while (focusIndx < this.arr.length) { // technically could be while(true) but we'll keep it as is so that error will be caught, rather than cause an infininte loop
      var leftChild = (focusIndx * 2 + 1 < this.arr.length) ? this.arr[focusIndx * 2 + 1] : null;
      var rightChild = (focusIndx * 2 + 2 < this.arr.length) ? this.arr[focusIndx * 2 + 2] : null;
      if ((leftChild == null || this.compFunct(parent, leftChild)) &&
        (rightChild == null || this.compFunct(parent, rightChild))) { // the parent is in the right place
        this.arr[focusIndx] = parent;
        return rtrn;
      } else if (rightChild == null || this.compFunct(leftChild, rightChild)) { // the parent should be replaced by the leftChild
        this.arr[focusIndx] = leftChild;
        focusIndx = focusIndx * 2 + 1;
      } else { // the parent should be replaced by the rightChild
        this.arr[focusIndx] = rightChild;
        focusIndx = focusIndx * 2 + 2;
      }
    }
    throw new Error("Priority Queue: an error occured in pop()");
  }
  push(obj) {
    this.arr.push(obj);

    // make sure the arr follows the heap property
    var focusIndx = this.arr.length - 1;

    while (focusIndx !== 0) {
      var parent = this.arr[((focusIndx + 1) >> 1) - 1];
      if (this.compFunct(obj, parent)) { // if the new object belongs in the parent's spot, switch them
        this.arr[focusIndx] = parent;
      } else {
        break;
      }

      focusIndx = ((focusIndx + 1) >> 1) - 1;
    }

    if (focusIndx < this.arr.length - 1) {
      this.arr[focusIndx] = obj;
    }
  }
  forEach(f) {
    this.arr.forEach(f);
  }
  isEmpty() {
    return this.arr.length == 0;
  }
  getSize() {
    return this.arr.length;
  }
  toString() {
    return this.arr.toString();
  }
}