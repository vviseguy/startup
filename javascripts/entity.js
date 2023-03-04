import { fuzzColor, myColors } from "./color_tools.js";
import { Point, TimeParallelepiped, TimeCylinder } from "./collisions_and_solids.js";
import { LinkedList } from "./dataStructures/LinkedList.js";
import { EventCard } from "./EventCard.js";
import { BOARD_TILE_WIDTH, PLAYER_ENT, CURRENT_T, GAME_ENV} from "../game.js";

export const NUM_TEAMS = 1;
export const NUM_ENTITY_BUCKETS = NUM_TEAMS + 3;

let temporal_front_time; // current game time
let temporal_front = Array.from({ length: NUM_ENTITY_BUCKETS }, (_, i) => new Set());

let entityBuckets = Array.from({ length: NUM_ENTITY_BUCKETS }, (_, i) => new Set()); // create an array with NUM_ENTITY_BUCKETS amount of sets.
/**
 * Entity buckets is an array of sets containing entities. The index refers to the team that they're on. These buckets are used for detecting collisions.
 *  0= is used as a "all team" team. For example, invincible players are in this category. The idea is that no entity will interact with entities of this class
 *  1= is used as a "no team" team. For example, walls are in this category. The idea is that every entity will interact with entities of this class
 *  2= is reserved for the team of common, spawned enemies 
 * 
 *  3+ are used as separate teams. For instance, each player could have their own team.
 * 
 * 
 * temporal_front is of the same organization
 */

let EventDeque = new LinkedList(); // contains event cards. haha get it, its a deque AND a deck --> do we really need a global one?

function convertCoords(x, y, doFrameOffset = false){
  let scalar = [0.1, 0.1];

  let offset = [0,0];
  if (doFrameOffset && PLAYER_ENT) {
    let center = PLAYER_ENT.getCoords(); //|| [350,350];
    offset = [50 - (center[0]) * scalar[0], 50 - (center[1]) * scalar[1]];
  }
  else offset = [0,0];

  return [x *scalar[0] + offset[0], y*scalar[1] + offset[1]];
}
export function adjustFrame(){
  if (PLAYER_ENT) {
    let center = convertCoords(...PLAYER_ENT.getCoords(), false);
    let offset = [50 - center[0], 50 - center[1]];

    GAME_ENV.style.left = offset[0] + "%";
    GAME_ENV.style.top = offset[1] + "%";
  }
}

// I dont think i need this function
export function jostleEntities(){
  for (let bucketNum = 0; bucketNum < NUM_ENTITY_BUCKETS; bucketNum++){
    for(let entity of entityBuckets[bucketNum]){
      entity.updateHTMLElement();
    }
  }
}
export function updateEntities(DEBUG = false){

  temporal_front_time = CURRENT_T;
  temporal_front = Array.from({ length: NUM_ENTITY_BUCKETS }, (_, i) => new Set());

  if (DEBUG) var entityUpdateCount = 0;
  for (let bucketNum = 1; bucketNum < NUM_ENTITY_BUCKETS; bucketNum++){
    for(let entity of entityBuckets[bucketNum]){
      // if (DEBUG) console.log(entity);
      entity.update();

      temporal_front[bucketNum].add(entity);
      entity.updateHTMLElement();
      if (DEBUG) entityUpdateCount++;
    }
  }
  if (DEBUG) console.log("Updatated "+entityUpdateCount+" entities");
  if (DEBUG) console.log(PLAYER_ENT.getCoords());
}

export class Collision extends EventCard{
  constructor(vector, otherParent, flipped = false){
    super("collision", vector.x * (flipped?-1:1), vector.y * (flipped?-1:1), otherParent, "local", vector.z);
  }
  asVector(){
    new Point(super.a, super.b, 0);
  }
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

    let movementVector = new Point(this.dx, this.dy, 0);
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
    const movementSpeed = 0.8;
    const projectileSpeed = 1;
    this.actions = {
      "ArrowLeft":  {type: "move", coords: [-movementSpeed, 0], isPressed: false},
      "ArrowUp":    {type: "move", coords: [ 0,-movementSpeed], isPressed: false},
      "ArrowDown":  {type: "move", coords: [ 0, movementSpeed], isPressed: false},
      "ArrowRight": {type: "move", coords: [ movementSpeed, 0], isPressed: false},

      "KeyA": {type: "shoot", coords: [-projectileSpeed, 0], isPressed: false}, // I could make the bullets' speed be addative to that of the player..
      "KeyW": {type: "shoot", coords: [ 0,-projectileSpeed], isPressed: false},
      "KeyS": {type: "shoot", coords: [ 0, projectileSpeed], isPressed: false},
      "KeyD": {type: "shoot", coords: [ projectileSpeed, 0], isPressed: false}
    };

    this.type = type;

    this.teamNum = teamNum; // starts at 1 - there is no 'team' 0
    this.entity_bucket_index = this.teamNum + 2;

    let scalar = 1
    switch(type){
      case "projectile":
        scalar = 0.125;
        this.lifeSpan = setTimeout(() => {this.kill();}, 1500); 
        this.onCollision = [
          this.kill
        ]; 
        break;
      case "player":
        scalar = 0.8;
        this.onCollision = [
          this.handleCollisionTree,
          (a, collidingObj, collision) => collidingObj.handleCollisionTree(collision)
        ]; // normal physics action
        break;
    }
    this.width  = BOARD_TILE_WIDTH * scalar;
    this.height = BOARD_TILE_WIDTH * scalar;
    

    if (teamNum > NUM_TEAMS)
      throw new Error("Tried to add an entity to a team that does not exist.");

    entityBuckets[this.entity_bucket_index].add(this);

    this.nextFrame = spawnFrame;
    this.pastFrames = new LinkedList();
    this.pushNextFrame();

    this.element = document.createElement("div");
    this.addClass("game-ent");
    this.addClass(type);
    this.changeColorUsingPreset(this.entity_bucket_index);
    
    const dims = convertCoords(this.width, this.height, false);
    this.element.style.width = dims[0]+0.01 + "%";
    this.element.style.height = dims[1]+0.01 + "%";
    GAME_ENV.appendChild(this.getElement());

    this.eventCardDeque = new LinkedList();
  }
  tToFrameIndex(t){
    return Math.min(
      Math.floor(t / TIME_BETWEEN_FRAMES),
      this.pastFrames.length
    );
  }
  addClass(htmlClass){
    this.element.classList.add(htmlClass);
  }
  kill(){
    entityBuckets[this.entity_bucket_index].delete(this);
    this.element.remove();
    delete this;
  }
  getCoords(){
    return [this.pastFrames.back().x,this.pastFrames.back().y];
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
    return this.pastFrames.at(pastFramesIndx).clone().projectTo(t);
  }
  affectPath(newFrame, endT = temporal_front_time){ // called when you want to put an entity in its place (due to collision, registering input, or rectifying wrongs)
    // detect glitchy looking movement
    if (this.getFrameAt(t).isDifferentSpotThan(newFrame)) throw new Error("SOMETHING VERY BAD HAPPENED: an entity glitched");

    cutFramesPastT(newFrame.t); 
    this.nextFrame = newFrame;
    updateCurrentFrame(endT);
  }
  removeCollision(t){
    cutFramesPastT(t);

  }
  cutFramesPastT(t){
    // cut off heads, return those frames
    return this.pastFrames.split((frame) => frame.t < t);
    // while(pastFrames.back().t > t) {
    //   let oldFrame = pastFrames.popBack();
    //   let spawningEvent = oldFrame.EventCard;
    //   if (spawningEvent.type === "collision") spawningEvent.obj.removeCollision(oldFrame.t);
    // }
  }
  trimCollisionsFromCutFrames(oldFrames){ // returns a list of objects whose braches have been cut
    let objsWithCutBranches = new LinkedList([this]);

    // cut off old collision trees
    for (let oldFrame of oldFrames){
      let spawningEvent = oldFrame.EventCard;
      let cutFrames = spawningEvent.obj.cutFramesPastT(oldFrame.t);
      objsWithCutBranches.join(spawningEvent.obj.trimCollisionsFromCutFrames(cutFrames));
    }

    return objsWithCutBranches;
  }
  // getCollisionT(otherEntity) {
  //   return this.getModel().getIntersectionT(otherEntity.getModel());
  // }
  // getCollisionConstraint(otherEntity) {
  //   return this.getModel().getIntersectionCosntraint(otherEntity.getModel());
  // }
  ratifyNextFrame(){ // proposes frames, and handles collisions until the nextFrame is valid
    let result = this.checkForCollisions();
    // handles collisions up until current time, leaving nextFrame as the valid next frame
    if (result != null){
      let [collision, ...otherCollision] = result;
      const collidingObject = collision.obj;
      for(let action of this.onCollision){
        action(collision, collidingObject, otherCollision); 
      }
    }
  }
  handleCollisionTree(collision){
    let collisionT = collision.t;
    let oldFrames = this.cutFramesPastT(collisionT); 

    // add movement up until the collision
    this.nextFrame = this.pastFrames.back().copy().projectTo(collisionT);
    this.pushNextFrame();

    // cut off old collision trees
    let objsToRegrow = this.trimCollisionsFromCutFrames(oldFrames);

    for (let obj of objsToRegrow){
      obj.update(collision.t);
    }

    this.nextFrame = this.pastFrames.back().copy().constrain(collision.asVector()).projectTo(collisionT);
    this.ratifyNextFrame();
  }
  enactCollision(otherEntity, collision_t) { // collision of type EntityFrame
    let oldFrames = this.cutFramesPastT(collision_t); 
    this.nextFrame = this.pastFrames.back().copy().projectTo(collision_t);
    this.pushNextFrame(); // might need changing bc nextFrame got repurposed from being currentFrame
    

    
    this.nextFrame = this.getFrameAt(collision_t);
    this.nextFrame.constrain(this.getCollisionConstraint(otherEntity));

    let otherEntity_new_path = otherEntity.getFrameAt(collision_t);
    otherEntity_new_path.constrain(otherEntity.getCollisionConstraint(this));

    otherEntity.affectPath(otherEntity_new_path); // this will handle the repercussions of an entity being knocked off-course. Note that the global temporal_front variable, is temporarily wrong about which entities are up-to-date. This fixes that asap.
  }
  getModel(endTime, startFrame = this.pastFrames.back()) {
    const vector = new Point(startFrame.dx, startFrame.dy, NaN);
    return new TimeParallelepiped(startFrame.x, startFrame.y, this.width, this.height, startFrame.t, endTime, vector); // build from current frame. look for a way to cache this
  }
  pushNextFrame(){
    this.pastFrames.pushBack(this.nextFrame);
    this.nextFrame = null;
  }
  proposeMove(t = CURRENT_T){
    this.nextFrame = this.pastFrames.back().clone();
    this.nextFrame.projectTo(t);
  }
  checkForCollisions(){ // tests this.nextFrame for colissions with entities in the relevant buckets in the temporal_front. Returns collision with lowest t
    let frstClsn = null;
    for (let i = 1; i < temporal_front.length; i++){
      if (i!=1 && i === this.entity_bucket_index) continue; // dont bother with collisions from entities on the same team (unless its in slot 1)
      for (let entity of temporal_front[i]){
        if (entity === this) continue; // don't interact with yourself
        let clsn = this.testCollisionWith(entity);
        if (clsn != null && (frstClsn == null || clsn[0].t < frstClsn[0].t)) frstClsn = clsn;
      }
    }
    return frstClsn;
  }
  testCollisionWith(entity, t){ // returns the first collision
    /* POSSIBLE TODO: test to make sure that entities overlap in time (this will be done by the model stuff too, so its not necessary) remember we could be testing a branch cut off from a previously developing collision */

    let firstIntersection;
    let intersection = null;
    let framesToTest = this.cutFramesPastT(this.pastFrames.back().t);
    if (!this.pastFrames.isEmpty()) framesToTest.pushFront(this.pastFrames.popBack()); // in case the previous frame also overlaps into t
    this.pastFrames.join(framesToTest);

    this.model = this.getModel(t);

    let lastFrame = null;
    framesToTest.forEach((value) => {
      if (lastFrame != null) {
        intersection = this.model.getIntersection(entity.getModel(lastFrame, value.t));
        if (intersection != null) return [new Collision(intersection, entity), new Collision(intersection, this, true)];
      }
      lastFrame = value;
    });
    if (lastFrame != null) { // there is a danger of assuming that this frame extends into the present, it wont if the rest of the obejct got cut off
      intersection = this.model.getIntersection(entity.getModel(lastFrame, t));
      if (intersection != null) return [new Collision(intersection, entity), new Collision(intersection, this, true)];
    }

    return null;
  }
  update(t = CURRENT_T) {
      if (t <= this.pastFrames.back().t) return;

      /** PROPOSE **/
      // sets nextFrame to the proposed move for the entity
      this.proposeMove(t);

      /** RATIFY **/
      this.ratifyNextFrame();

      /** UPDATE **/
      // sets the current frame to nextFrame
      this.pushNextFrame(); 
      
  } // eventually reroute to updateCurrentFrame, this is a lazy updateCurrentFrame for when i'm testing without collisions
  updateCurrentFrame(t = CURRENT_T) {
    if (t !== this.pastFrames.back().t) return; // skip calculations if current frame already matches the current time
    const diffToLastFrame = t - this.pastFrames.back().t;

    const pastFramesIndx = tToFrameIndex(t);
    const diffToSavedFrame = t - pastFramesIndx * TIME_BETWEEN_FRAMES;

    let referenceFrame;
    if (diffToLastFrame >= 0 && diffToLastFrame <= diffToSavedFrame) {
      // develop current frame from most recent frame
      referenceFrame = this.pastFrames.back().clone(); // may or may not need to copy
    } else {
      // develop current frame from most recent frame
      referenceFrame = this.pastFrames.at(pastFramesIndx);
    }
    this.updateCurrentFrameFromFrame(referenceFrame);
  }
  updateCurrentFrameFromFrame(referenceFrame, t = CURRENT_T) {
    while (this.pastFrames.back().t < t){
      // default option is making it to the correct time
      let nextFrameT = t;

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
    for (let i = 1; i < NUM_ENTITY_BUCKETS; i++){
      if (i == this.entity_bucket_index) continue;

      for (const ent of temporal_front[i]){
        yield ent;
      }
    }
    // returns an iteratable object of entities who's paths have already been generated
  }
  findIfKeyPressed(key){ // the long but technically more accurate way of finding if a key is pressed.. for if the time just changed a lot..
    let lastEventWithKey = this.eventCardDeque.iterateBackwards(
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

    let card = new EventCard("user_input", key, isKeyPressed);
    this.eventCardDeque.pushBack(card);
  
  }
  handleAction(action, isDownStroke, t = new Date().getTime()){
    const newFrame = this.pastFrames.back().clone().projectTo(t);

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
    let currentFrame = this.pastFrames.back();
    if (DEBUG) console.log(this.type);
    if (DEBUG) console.log(this.pastFrames);
    if (DEBUG) console.log(currentFrame);
    const coords = convertCoords(currentFrame.x - this.width/2, currentFrame.y - this.height/2);
    this.element.style.left = coords[0] + "%";
    this.element.style.top = coords[1] + "%";
  };
};

//** END EXPORT STATEMENTS **//

/* BEGIN PLAYER MOVEMENT */


// let keysDown = new Set();
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
