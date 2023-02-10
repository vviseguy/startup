import { fuzzColor, myColors } from "./color_tools.js";
import { Point, TimeParallelepiped, TimeCylinder } from "./collisions_and_solids.js";
import { LinkedList } from "./dataStructures/LinkedList.js";
import { temporal_front, temporal_front_time, NUM_ENTITY_BUCKETS } from "../game.js";

class EntityFrame {
  constructor(x, y, t, dx = 0, dy = 0) {
    this.x = x;
    this.y = y;
    this.t = t;

    this.dx = dx;
    this.dy = dy;
  }
  clone() {
    return new EntityFrame(this.x, this.y, this.t);
  }
  projectTo(t){ // continue as if nothing happened
    const dt = t - this.t;
    this.x += this.dx * dt;
    this.y += this.dy * dt;
  }
  isDifferentSpotThan(otherFrame){
    return this.x == otherFrame.x &&
           this.y == otherFrame.y &&
           this.t == otherFrame.t; // is it necessary to compare the time components? .. at least its logically complete..
  }
  constrain(collisionVector){ // constrain movement to the plane perpendicular to the vector
    // just in case
    collisionVector.z = 0;

    var movementVector = new Point(this.dx, this.dy, 0);
    movementVector = movementVector.sub(movementVector.getProjOnto(collisionVector));

    this.dx = movementVector.x;
    this.dy = movementVector.y;
  }
}
export class Entity {
  type; // string representing the name of the type of entity
  entity_bucket_index; // the entity bucket to which this entity belongs

  TIME_BETWEEN_FRAMES = 1000; // in ms
  currentFrame; // might be possible to get rid of this, and just do .last() on the pastFrames array
  pastFrames; // array holding past frames for this Entity

  movement_vectors; //
  movement_restirctions; // arr of all movement restrictions in the form of vectors, movement in the which direction is not allowed.

  // time_paralellapiped;

  constructor(x = 0, y = 0) {
    this.element = document.createElement("div");
  }
  tToFrameIndex(t){
    // return Math.min(
    //   Math.floor(t / TIME_BETWEEN_FRAMES),
    //   this.pastFrames.length
    // );
  }
  getFrameAt(t){ // get an Entity's location at a specific point in time
    const pastFramesIndx = tToFrameIndex(t);
    return this.pastFrames.at(pastFramesIndx).clone().projectTo(t);
  }
  affectPath(newFrame, endT = temporal_front_time){ // called when you want to put an entity in its place (due to collision, registering input, or rectifying wrongs)
    // detect glitchy looking movement
    if (this.getFrameAt(t).isDifferentSpotThan(newFrame)) throw new Error("SOMETHING VERY BAD HAPPENED: an entity glitched");

    cutFramesPastT(newFrame.t); 
    this.currentFrame = newFrame;
    updateCurrentFrame(endT);
  }
  cutFramesPastT(t){
    while(pastFrames.back().t > t) pastFrames.popBack();
  }
  getCollisionT(otherEntity) {
    return this.getModel().getIntersectionT(otherEntity.getModel());
  }
  getCollisionConstraint(otherEntity) {
    return this.getModel().getIntersectionCosntraint(otherEntity.getModel());
  }
  enactCollision(otherEntity, collision_t) { // collision of type EntityFrame
    cutFramesPastT(collision_t); 
    this.pastFrames.pushBack(this.currentFrame);

    this.currentFrame = this.getFrameAt(collision_t);
    this.currentFrame.constrain(this.getCollisionConstraint(otherEntity));

    var otherEntity_new_path = otherEntity.getFrameAt(collision_t);
    otherEntity_new_path.constrain(otherEntity.getCollisionConstraint(this));

    otherEntity.affectPath(otherEntity_new_path); // this will handle the repercussions of an entity being knocked off-course. Note that the global temporal_front variable, is temporarily wrong about which entities are up-to-date. This fixes that asap.
  }
  getModel(t) {
    const frameIndx = tToFrameIndex(t);
    const startFrame = this.pastFrames.at(frameIndx);
    const endFrame = 
    this.updateCurrentFrame(t);
    return new TimeParalellapiped(x, y, w, l, t1, t2, vector); // build from current frame. look for a way to cache this
  }


  updateCurrentFrame(t) {
    if (t !== this.currentFrame.t) return; // skip calculations if current frame already matches the current time
    const diffToLastFrame = t - this.currentFrame.t;

    const pastFramesIndx = tToFrameIndex(t);
    const diffToSavedFrame = t - pastFramesIndx * TIME_BETWEEN_FRAMES;

    var referenceFrame;
    if (diffToLastFrame >= 0 && diffToLastFrame <= diffToSavedFrame) {
      // develop current frame from most recent frame
      referenceFrame = this.currentFrame.clone(); // may or may not need to copy
    } else {
      // develop current frame from most recent frame
      referenceFrame = this.pastFrames.at(pastFramesIndx);
    }
    this.updateCurrentFrameFromFrame(referenceFrame);
  }
  updateCurrentFrameFromFrame(referenceFrame, t) {
    while (this.currentFrame.t < t){
      // default option is making it to the correct time
      var nextFrameT = t;

      // find the first collision,
      for (const otherEntity of this.getRelevantEntities()){
        const collision_t = this.getCollisionT(otherEntity); // too much async may result in testing things that have already collided
        if (collision_t >= 0 && collision_t < nextFrameT)
          nextFrameT = collision_t;
      }

      // then process it
      this.enactCollision(nextFrameT);
    }
    
  }
  *getRelevantEntities() { // could optomize later for locale
    for (var i = 1; i < NUM_ENTITY_BUCKETS; i++){
      if (i == this.entity_bucket_index) continue;

      for (const ent of temporal_front[i]){
        yield ent;
      }
    }
    // returns an iteratable object of entities who's paths have already been generated
  }
}
export class PlayerEntity extends Entity {
  movement_vectors = {
    37: "moveLeft",
    38: "moveRight",
    39: [1, 0],
  };

  constructor(type, team = 4) {
    super();
    this.type = type;
    if (team > NUM_ENTITY_BUCKETS)
      throw new Error(
        "No such team! Tried to add an entity to a team that does not exist."
      );
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
document.addEventListener("keydown", (e) => {
  keysDown.add(e.keyCode);
});
document.addEventListener("keyup", (e) => {
  keysDown.delete(e.keyCode);
});

function updateBox() {
  if (keysDown.has(37)) {
    // left arrow
    x -= 2;
  }
  if (keysDown.has(38)) {
    // up arrow
    y -= 2;
  }
  if (keysDown.has(39)) {
    // right arrow
    x += 2;
  }
  if (keysDown.has(40)) {
    // down arrow
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

  x += (dx * dT) / 1000;
  y += (dy * dT) / 1000;

  dx = Math.sin(time / 1000) * 10;
  dy = Math.cos(time / 1000) * 10;

  // plot movement
  // check for collisions -> mark them as an event
  // run till collision
  // apply movement changes
  // repeat for remaining movement
}
