import { fuzzColor, myColors } from "./color_tools.js";
import { TimeParallelepiped, TimeCylinder } from "./collisions_and_solids.js";
  
export class Entity {
    x; // coords
    y;
    type; // string representing the name of the type
  
    movement_vectors; // 
    movement_restirctions; // arr of all movement restrictions in the form of vectors, movement in the which direction is not allowed.
  
    entity_bucket_index; // the entity bucket to which this entity belongs
  
    constructor(x = 0, y = 0) {
      this.element = document.createElement("div");
    }
    getParalellapiped() {
      return new TimeParalellapiped(x, y, w, l, t1, t2, vector);
    }
}
export class PlayerEntity extends Entity {
    movement_vectors = {
      37: "moveLeft",
      38: "moveRight",
      39: [1, 0],
    }
    
    constructor(type, team = 4) {
      super();
      this.type = type;
      if (team > NUM_ENTITY_BUCKETS) throw new Error('No such team! Tried to add an entity to a team that does not exist.');
      this.entity_bucket_index = team;
      this.element = document.createElement("div");
      this.element.classList.add("block");
  
      this.element.style.background = fuzzColor(myColors[type]);
    }
  
}

//** END EXPORT STATEMENTS **//



/* BEGIN PLAYER MOVEMENT */


let box = document.getElementById("box");
let x = 50;
let y = 50;
let dx = 1;
let dy = 1;

var keysDown = new Set();
document.addEventListener("keydown", (e) => { keysDown.add(e.keyCode); });
document.addEventListener("keyup", (e) => { keysDown.delete(e.keyCode); });

function updateBox() {
  if (keysDown.has(37)) { // left arrow
    x -= 2;
  }
  if (keysDown.has(38)) { // up arrow
    y -= 2;
  }
  if (keysDown.has(39)) { // right arrow
    x += 2;
  }
  if (keysDown.has(40)) { // down arrow
    y += 2;
  }

  box.style.left = x + "%";
  box.style.top = y + "%";
}

let pTime = new Date().getTime();
let time = new Date().getTime();
function loop() {
  pTime = time;
  time = new Date().getTime();

  // updatePhysics(time, pTime);
  updateBox();

  box.style.left = x + "%";
  box.style.top = y + "%";
}

/* END PLAYER MOVEMENT */

function updatePhysics(time, pTime) {
  let dT = time - pTime;

  x += dx * dT / 1000;
  y += dy * dT / 1000;

  dx = Math.sin(time / 1000) * 10;
  dy = Math.cos(time / 1000) * 10;

  // plot movement
  // check for collisions -> mark them as an event
  // run till collision
  // apply movement changes
  // repeat for remaining movement

} 