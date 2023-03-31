class LinkedListNode {
  constructor(value, previous = null, next = null) {
    this.value = value;
    this.next = next;
    this.previous = previous;
  }
}
export class LinkedList { // technically a doubly linked-list... but i dont want to type that out
  length = 0;
  head = null;
  tail = null;
  constructor(arr = []) {
    arr.forEach((obj) => { this.pushBack(obj) });
  }

  pushBack(obj) {
    if (obj == null) throw new Error("Linked List: adding null object");
    if (this.length == 0) {
      this.head = new LinkedListNode(obj);
      this.tail = this.head;
    } else {
      this.tail.next = new LinkedListNode(obj);
      this.tail.next.previous = this.tail;
      this.tail = this.tail.next;
    }
    this.length++;
  }
  pushFront(obj) {
    if (obj == null) throw new Error("Linked List: adding null object");
    if (this.length == 0) {
      this.head = new LinkedListNode(obj);
      this.tail = this.head;
    } else {
      this.head.previous = new LinkedListNode(obj);
      this.head.previous.next = this.head;
      this.head = this.head.previous;
    }
    this.length++;
  }
  insert(obj, indx) {
    if (indx < 0) throw new Error("Linked List: insert indx less than 0");
    if (indx == 0) return this.pushFront(obj);

    let newNode = new LinkedListNode(obj, this.head);
    for (let i = 0; i < indx - 1; i++) {
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

    for (let i = 0; i < indx; i++) {
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
  at(indx){
    return this.get(indx);
  }
  get(indx) {
    if (indx < 0) throw new Error("Linked List: get indx less than 0");
    let rtrn = this.head;
    for (let i = 0; i < indx; i++) {
      if (rtrn == null) throw new Error("Linked List: get indx greater than list length");
      rtrn = rtrn.next;
    }
    if (rtrn == null) {
      console.log(this);
      console.log(indx);
      return null;

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
    for (let node = this.head; node != null; node = node.next) {
      f(node.value);
    }
  }
  [Symbol.iterator]() {
    let curr = this.head;
    return {
      next() {
        if (curr !== null){
          const rtrn = curr.value;
          curr = curr.next;
          return { value: rtrn, done: false };
        } 
        else return { done: true };
      }
    };
  }
  toString() {
    if (this.length == 0) return "";

    let s = "";
    this.forEach((obj) => { s += " " + obj });

    return s.substr(1);
  }
  indexOf(val){
    ///
  }
  iterateBackwards(condition, funct){
    let node;
    for (let node = this.tail; node != null && condition(node.value); node = node.previous) {
      funct(node.value);
    }
    if (node != null) return node.value;
  }
  iterateForwards(condition, funct){
    let node;
    for (node = this.head; node != null && condition(node.value); node = node.next) {
      funct(node.value);
    }
    if (node != null) return node.value;
  }
  insertInOrder(obj,funct,start){
    // finds the spot for the objects in the list by binary search and inserts it
  }
  split(funct){ // splits the array before the first node (from the front) where the function returns true
    let node;
    let newList = new LinkedList();
    if(this.head == null || funct(this.head.value)) return newList;
    
    let newLength = 1
    for (node = this.head; node.next != null; node = node.next) {
      if (funct(node.next.value)) break;
      newLength++;
    }


    // set new list
    newList.head = this.head;
    newList.tail = node;
    newList.length = newLength;
    
    // fix old list
    if (node.next === null) {
      this.head = null;
      this.tail = null;
      this.length = 0;
    } else {
      this.head = node.next;
      this.head.previous = null;

      this.length -= newLength;
    }

    // get rid of conenction between the two lists
    node.next = null;

    return newList;
  }
  

  join(otherList){
    if (this.length == 0) {
      this.head   = otherList.head;
      this.tail   = otherList.tail;
      this.length = otherList.length;
    }
    else if (otherList.length > 0){
      this.tail.next = otherList.head;
      otherList.head.previous = this.tail;
      this.tail = otherList.tail;
      this.length += otherList.length;
    }
  }
}
