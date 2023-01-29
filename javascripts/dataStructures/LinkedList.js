function testLinkedList() {
  console.log("Testing Linked List...");
  
  var myList = new LinkedList([1, 2, 3]);
  
  console.log(myList.toString());
  myList.pushBack(4);
  myList.pushFront(5);
  console.log(myList.toString());
  myList.insert("pi", 4);
  console.log(myList.toString());
  console.log("pop(3): "+myList.pop(3));
  console.log("popFront: "+myList.popFront());
  console.log("popBack: "+myList.popBack());
  console.log("popFront: "+myList.popFront());
  console.log(myList.toString());
  console.log("length: "+myList.length);
  console.log("popBack: "+myList.popBack());
  console.log("isEmpty: "+myList.isEmpty());
  console.log("popBack: "+myList.popBack());
  console.log("isEmpty: "+myList.isEmpty());
  
}
class LinkedListNode {
  constructor(value, previous = null, next = null) {
    this.value = value;
    this.next = next;
    this.previous = previous;
  }
}
class LinkedList { // technically a doubly linked-list... but i dont want to type that out
  length = 0;
  head = null;
  tail = null;
  constructor(arr = []) {
    arr.forEach((obj) => { this.pushBack(obj) });
  }

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
  }

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

  forEach(f) {
    for (var node = this.head; node != null; node = node.next) {
      f(node.value);
    }
  }
  toString() {
    if (this.length == 0) return "";

    let s = "";
    this.forEach((obj) => { s += " " + obj });

    return s.substr(1);
  }

  insertInOrder(obj,funct,start){
    // finds the spot for the objects in the list by binary search and inserts it
  }
}