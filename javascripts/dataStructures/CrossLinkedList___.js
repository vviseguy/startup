/*
              UNFINISHED, and probably unneeded
*/

function testCrossLinkedList() {
  console.log("Testing Linked List...");

  var myList = new CrossLinkedList([1, 2, 3]);

  console.log(myList.toString());
  myList.pushBack(4);
  myList.pushFront(5);
  console.log(myList.toString());
  myList.insert("pi", 4);
  console.log(myList.toString());
  console.log("pop(3): " + myList.pop(3));
  console.log("popFront: " + myList.popFront());
  console.log("popBack: " + myList.popBack());
  console.log("popFront: " + myList.popFront());
  console.log(myList.toString());
  console.log("length: " + myList.length);
  console.log("popBack: " + myList.popBack());
  console.log("isEmpty: " + myList.isEmpty());
  console.log("popBack: " + myList.popBack());
  console.log("isEmpty: " + myList.isEmpty());

}
class CrossLinkedListNode {
  constructor(value, previouses, nexts, functions) {
    this.value = value;
    this.axes; // items of [sort function, .next, and .previous]
    for (var i = 0; i = functions.length; i++) {
      this.axes[i] = {
        previous: previouses[i],
        next: nexts[i]
      }
    }
    this.numDim = connections.length;
  }
}
class CrossLinkedList { // technically a doubly linked-list... but i dont want to type that out
  length = 0;
  constructor(arr = [], functions = []) {
    this.numAxis = functions.length;
    this.functions = functions;
    this.heads;
    this.tails;
    for (var i = 0; i < this.numAxis; i++) {
      this.heads.pushBack(null);
      this.tails.pushBack(null);
    }
    arr.forEach((obj) => { this.pushBack(obj) });
  }

  /**
  pushBack(obj) {
    if (this.length == 0) {
      this.head = new LinkedListNode(obj);
      this.tail = this.head;
    } else {
      this.tail.next = new LinkedListNode(obj, this.tail);
      this.tail = this.tail.next;
    }
    this.length++;
  }
  pushFront(obj) {
    if (this.length == 0) {
      this.head = new LinkedListNode(obj);
      this.tail = this.head;
    } else {
      this.head.previous = new LinkedListNode(obj, undefined, this.head);
      this.head = this.head.previous;
    }
    this.length++;
  }
  insert(obj, indx) {
    if (indx < 0) throw new Error("Linked List: insert indx less than 0");
    if (indx == 0) return this.pushFront(obj);

    var newNode = new LinkedListNode(obj, this.head);
    for (var i = 0; i < indx - 1; i++) {
      if (newNode.previous == null) throw new Error("Linked List: insert indx greater than list length+1");
      newNode.previous = newNode.previous.next;
    }
    newNode.next = newNode.previous.next;
    newNode.previous.next = newNode;
    if (newNode.next !== null) newNode.next.previous = newNode;
    this.length++;
  }*/

  popBack() {
    let rtrn = this.tail;
    if (this.length == 0) throw new Error("Linked List: cannot pop - no objects in list");
    else if (this.length == 1) this.head = null;
    else this.tail.previous.next = null;
    this.tail = this.tail.previous;
    this.length--;

    return rtrn.value;
  }
  popFront() {
    let rtrn = this.head;

    if (this.length == 0) throw new Error("Linked List: cannot pop - no objects in list");
    else if (this.length == 1) this.tail = null;
    else this.head.next.previous = null;
    this.head = this.head.next;
    this.length--;

    return rtrn.value;
  }
  pop(indx) {
    if (this.length == 0) throw new Error("Linked List: cannot pop - no objects in list");
    if (indx < 0) throw new Error("Linked List: pop indx less than 0");
    else if (indx == 0) return this.popFront();
    else if (indx == this.legnth - 1) return this.popBack();

    let rtrn = this.head;

    for (var i = 0; i < indx; i++) {
      if (rtrn == null) throw new Error("Linked List: pop indx greater than list length");
      rtrn = rtrn.next;
    }

    rtrn.previous.next = rtrn.next;
    rtrn.next.previous = rtrn.previous;
    this.length--;

    return rtrn.value;
  }

  front() {
    return this.head.value;
  }
  back() {
    return this.tail.value;
  }
  get(indx) {
    if (indx < 0) throw new Error("Linked List: get indx less than 0");
    let rtrn = this.head;
    for (var i = 0; i < indx; i++) {
      if (rtrn == null) throw new Error("Linked List: get indx greater than list length");
      rtrn = rtrn.next;
    }
    return rtrn.value;
  }

  length() {
    return this.length;
  }
  isEmpty() {
    return this.length == 0;
  }

  forEach(index, f) {
    for (var node = this.dimension[index].head; node != null; node = node.next) {
      f(node.value);
    }
  }

  toString() {
    if (this.length == 0) return "";

    let s = "";
    this.forEach((obj) => { s += " " + obj });

    return s.substr(1);
  }

  insertInOrder(obj, start = this.head) {
    var newNode = new CrossLinkedListNode(obj);

    this.axes.forEach((axis) => {
      /**
       *  > 0 the first item should have priority
       *  = 0 the objects are a match in priority
       *  < 0 the second item has priority
       */
      var match = axis.function(obj,);
      // insert newNode with the function
    });
    // finds the spot for the objects in the list by binary search and inserts it
  }
}