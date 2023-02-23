import { fuzzColor, myColors } from "./color_tools.js";
import { Point, TimeParallelepiped, TimeCylinder } from "./collisions_and_solids.js";
import { LinkedList } from "./dataStructures/LinkedList.js";
import { EventCard } from "./EventCard.js";
import { BOARD_TILE_WIDTH, PLAYER_ENT, CURRENT_T, GAME_ENV} from "../game.js";

export const NUM_TEAMS = 1;
export const NUM_ENTITY_BUCKETS = NUM_TEAMS + 3;

var temporal_front = Array.from({ length: NUM_ENTITY_BUCKETS }, (_, i) => new Set());
var temporal_front_time; // current game time

var entityBuckets = Array.from({ length: NUM_ENTITY_BUCKETS }, (_, i) => new Set()); // create an array with NUM_ENTITY_BUCKETS amount of sets.

var EventDeque = new LinkedList(); // contains event cards. haha get it, its a deque AND a deck --> do we really need a global one?

function convertCoords(x, y, doFrameOffset = true){
  var scalar = [0.1, 0.1];

  var offset = [0,0];
  if (doFrameOffset && PLAYER_ENT) {
    var center = PLAYER_ENT.getCoords(); //|| [350,350];
    offset = [50 - (center[0]) * scalar[0], 50 - (center[1]) * scalar[1]];
  }
  else offset = [0,0];

  return [x *scalar[0] + offset[0], y*scalar[1] + offset[1]];
}

// I dont think i need this function
export function jostleEntities(){
  for (var bucketNum = 0; bucketNum < NUM_ENTITY_BUCKETS; bucketNum++){
    for(var entity of entityBuckets[bucketNum]){
      entity.updateHTMLElement();
    }
  }
}
export function updateEntities(DEBUG = false){

  temporal_front_time = CURRENT_T;
  temporal_front = Array.from({ length: NUM_ENTITY_BUCKETS }, (_, i) => new Set());

  if (DEBUG) var entityUpdateCount = 0;
  for (var bucketNum = 0; bucketNum < NUM_ENTITY_BUCKETS; bucketNum++){
    for(var entity of entityBuckets[bucketNum]){
      if (DEBUG) console.log(entity);
      entity.update(temporal_front_time);
      temporal_front[bucketNum].add(entity);
      entity.updateHTMLElement();
      if (DEBUG) entityUpdateCount++;
    }
  }
  if (DEBUG) console.log("Updatated "+entityUpdateCount+" entities");
  if (DEBUG) console.log(PLAYER_ENT.getCoords());
}
export class EntityFrame {
  constructor(x, y, t, motion, eventCard = null) {
    this.x = x;
    this.y = y;
    this.t = t; 
    if (t==0) throw new Error("t is too small");

    this.dx = motion[0];
    this.dy = motion[1];

    this.eventCard = eventCard; // a pointer to the event that spawned this frame
  }
  clone() {
    return new EntityFrame(this.x, this.y, this.t, [this.dx, this.dy], this.eventCard);
  }
  projectTo(t){ // continue as if nothing happened
    const dt = t - this.t;
    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.t = t;
    return this;
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
  addMovement(motionArr, isFlipped = false){
    this.dx += motionArr[0] * (isFlipped?-1:1);
    this.dy += motionArr[1] * (isFlipped?-1:1);
  }
  zeroMotion(){
    this.dx = 0;
    this.dy = 0;
  }
}


export class Entity {

  b = "sfgsg";
  a = "asdfa"
  // type; // string representing the name of the type of entity
  // teamNum;
  // entity_bucket_index; // the entity bucket to which this entity belongs
  
  TIME_BETWEEN_FRAMES = 1000; // in ms

  /**
   * I have been thinking about removing the current frame in favor of just getting the last item off of past frames.. but it could be helpful to change it to "next frame" as a sort of buffer...
   */
  // nextFrame; // might be possible to get rid of this, and just do .last() on the pastFrames array
  // frames; // array holding past frames for this Entity

  movement_vectors; //
  movement_restirctions; // arr of all movement restrictions in the form of vectors, movement in the which direction is not allowed.

  // time_paralellapiped;

  constructor(type = "npc", teamNum = 1, spawnFrame = new EntityFrame(0, 0, CURRENT_T, [0,0.2], null)) {
    this.actions = {
      "ArrowLeft":  {type: "move", coords: [-1, 0], isPressed: false},
      "ArrowUp":    {type: "move", coords: [ 0,-1], isPressed: false},
      "ArrowDown":  {type: "move", coords: [ 0, 1], isPressed: false},
      "ArrowRight": {type: "move", coords: [ 1, 0], isPressed: false},

      "KeyA": {type: "shoot", coords: [-1.2, 0], isPressed: false}, // I could make the bullets' speed be addative to that of the player..
      "KeyW": {type: "shoot", coords: [ 0,-1.2], isPressed: false},
      "KeyS": {type: "shoot", coords: [ 0, 1.2], isPressed: false},
      "KeyD": {type: "shoot", coords: [ 1.2, 0], isPressed: false}
    };

    this.type = type;

    this.teamNum = teamNum; // starts at 1 - there is no team 0
    this.entity_bucket_index = (this.teamNum + 1);
    this.b = (this.teamNum + 1);

    switch(type){
      case "projectile":
        console.log("making projectile");
        this.width  = BOARD_TILE_WIDTH/8;
        this.height = BOARD_TILE_WIDTH/8;
        this.lifeSpan = setTimeout(() => {this.kill();}, 1500); 
        break;
      default:
        this.width  = BOARD_TILE_WIDTH;
        this.height = BOARD_TILE_WIDTH;
    }

    

    if (teamNum > NUM_TEAMS)
      throw new Error("Tried to add an entity to a team that does not exist.");

    entityBuckets[this.entity_bucket_index].add(this);

    this.nextFrame = spawnFrame;
    this.frames = new LinkedList();
    this.pushNextFrame();

    this.element = document.createElement("div");
    this.addClass("game-ent");
    this.addClass(type);
    this.changeColorUsingPreset(this.entity_bucket_index);
    
    const dims = convertCoords(this.width, this.height, false);
    this.element.style.width = dims[0]+0.5 + "%";
    this.element.style.height = dims[1]+0.5 + "%";
    GAME_ENV.appendChild(this.getElement());

    this.eventCardDeque = new LinkedList();



  }
  tToFrameIndex(t){
    return Math.min(
      Math.floor(t / TIME_BETWEEN_FRAMES),
      this.frames.length
    );
  }
  addClass(htmlClass){
    this.element.classList.add(htmlClass);
  }
  kill(){
    entityBuckets[this.entity_bucket_index].delete(this);
    this.element.remove();
  }
  getCoords(){
    return [this.frames.back().x,this.frames.back().y];
  }
  changeColor(backgroundColor){
    this.element.style.background = backgroundColor;
  }
  changeColorUsingPreset(colorIndex){
    colorIndex = colorIndex < 0 ? 0 : colorIndex % myColors.length; // ensure the index is within the bounds

    this.element.style.background = fuzzColor(myColors[colorIndex]);
  }
  getFrameAt(t){ // get an Entity's location at a specific point in time
    const pastFramesIndx = tToFrameIndex(t);
    return this.frames.at(pastFramesIndx).clone().projectTo(t);
  }
  affectPath(newFrame, endT = temporal_front_time){ // called when you want to put an entity in its place (due to collision, registering input, or rectifying wrongs)
    // detect glitchy looking movement
    if (this.getFrameAt(t).isDifferentSpotThan(newFrame)) throw new Error("SOMETHING VERY BAD HAPPENED: an entity glitched");

    cutFramesPastT(newFrame.t); 
    this.nextFrame = newFrame;
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

    this.pushNextFrame(); // might need changing bc nextFrame got repurposed from being currentFrame
    

    
    this.nextFrame = this.getFrameAt(collision_t);
    this.nextFrame.constrain(this.getCollisionConstraint(otherEntity));

    var otherEntity_new_path = otherEntity.getFrameAt(collision_t);
    otherEntity_new_path.constrain(otherEntity.getCollisionConstraint(this));

    otherEntity.affectPath(otherEntity_new_path); // this will handle the repercussions of an entity being knocked off-course. Note that the global temporal_front variable, is temporarily wrong about which entities are up-to-date. This fixes that asap.
  }
  getModel(t) {
    const frameIndx = tToFrameIndex(t);
    const startFrame = this.frames.at(frameIndx);
    const endFrame = 
    this.updateCurrentFrame(t);
    return new TimeParallelepiped(x, y, w, l, t1, t2, vector); // build from current frame. look for a way to cache this
  }
  pushNextFrame(){
    this.frames.pushBack(this.nextFrame);
    this.nextFrame = null;
  }
  update(t = CURRENT_T) {
    if (this.nextFrame == null) {
      this.nextFrame = this.frames.back().clone();
      this.nextFrame.projectTo(t);
    }
    this.pushNextFrame();
  } // eventually reroute to updateCurrentFrame, this is a lazy updateCurrentFrame for when i'm testing without collisions
  updateCurrentFrame(t = CURRENT_T) {
    if (t !== this.frames.back().t) return; // skip calculations if current frame already matches the current time
    const diffToLastFrame = t - this.frames.back().t;

    const pastFramesIndx = tToFrameIndex(t);
    const diffToSavedFrame = t - pastFramesIndx * TIME_BETWEEN_FRAMES;

    var referenceFrame;
    if (diffToLastFrame >= 0 && diffToLastFrame <= diffToSavedFrame) {
      // develop current frame from most recent frame
      referenceFrame = this.frames.back().clone(); // may or may not need to copy
    } else {
      // develop current frame from most recent frame
      referenceFrame = this.frames.at(pastFramesIndx);
    }
    this.updateCurrentFrameFromFrame(referenceFrame);
  }
  updateCurrentFrameFromFrame(referenceFrame, t = CURRENT_T) {
    while (this.frames.back().t < t){
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
  findIfKeyPressed(key){ // the long but technically more accurate way of finding if a key is pressed.. for if the time just changed a lot..
    var lastEventWithKey = this.eventCardDeque.iterateBackwards(
        (card) => { // condition to evaluate
          !(card.type = "user_input" && card.a == key)
        },
        ()=>{} // function to evaluate
      );
    if (!lastEventWithKey) return false; // the key is not pressed if we couldnt find any event with this key
    return lastEventWithKey.b; // return whether the last action was swtiching this key to "pressed"
  }
  addCard(card){
    eventCardDeque.pushBack(card);
  }
  getElement(){
    return this.element;
  }
  toggleKey(key, t = new Date().getTime()){
    // relies on the correct state being in the movement vectors
    const thisKeyAction = this.actions[key]
    const isKeyPressed = !thisKeyAction.isPressed;
    this.actions[key].isPressed = isKeyPressed; // toggle whether its pressed
    
    this.handleAction(thisKeyAction, isKeyPressed, t);

    var card = new EventCard("user_input", key, isKeyPressed);
    this.eventCardDeque.pushBack(card);
  
  }
  handleAction(action, isDownStroke, t = new Date().getTime()){
    const newFrame = this.frames.back().clone().projectTo(t);

    switch(action.type){
      case "shoot":
        if (isDownStroke) {
          newFrame.zeroMotion(); // this makes the bullet speed not addative to the player movement
          newFrame.addMovement(action.coords);
          const bullet = new Entity("projectile", this.teamNum, newFrame);
          console.log(bullet);
        }
        break;
      case "move":
        this.nextFrame = newFrame;
        this.nextFrame.addMovement(action.coords, !isDownStroke);
        this.pushNextFrame(t);
        break;
      default:
        console.log("Error: undefined action type: "+action.type)
    }
  }
  updateHTMLElement(DEBUG = false){
    var currentFrame = this.frames.back();
    if (DEBUG) console.log(this.type);
    if (DEBUG) console.log(this.frames);
    if (DEBUG) console.log(currentFrame);
    const coords = convertCoords(currentFrame.x - this.width/2, currentFrame.y - this.height/2);
    this.element.style.left = coords[0] + "%";
    this.element.style.top = coords[1] + "%";
  };
};

//** END EXPORT STATEMENTS **//

/* BEGIN PLAYER MOVEMENT */


// var keysDown = new Set();
// document.addEventListener("keydown", (e) => {
//   keysDown.add(e.keyCode);
// });
// document.addEventListener("keyup", (e) => {
//   keysDown.delete(e.keyCode);
// });

// function updateBox() {
//   if (keysDown.has(37)) {
//     // left arrow
//     x -= 2;
//   }
//   if (keysDown.has(38)) {
//     // up arrow
//     y -= 2;
//   }
//   if (keysDown.has(39)) {
//     // right arrow
//     x += 2;
//   }
//   if (keysDown.has(40)) {
//     // down arrow
//     y += 2;
//   }

//   box.style.left = x + "%";
//   box.style.top = y + "%";
// }



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
