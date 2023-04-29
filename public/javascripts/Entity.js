import { fuzzColor, myColors } from "./color_tools.js";
import { Point, TimeParallelepiped, TimeCylinder } from "./collisions_and_solids.js";
import { LinkedList } from "./dataStructures/LinkedList.js";
import { EventCard } from "./EventCard.js";
import { BOARD_TILE_WIDTH, PLAYER_ENT, CURRENT_T, GAME_ENV, updateCurrentTime, doCollisions} from "../load_game.js";

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
export function adjustViewport(){
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
  console.log("jostling entities");
}
export function updateEntities(DEBUG = false){

  temporal_front_time = CURRENT_T;
  temporal_front = Array.from({ length: NUM_ENTITY_BUCKETS }, (_, i) => new Set());

  if (DEBUG) var entityUpdateCount = 0;
  for (let bucketNum = 0; bucketNum < NUM_ENTITY_BUCKETS; bucketNum++){
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

let otherPlayers = new Set();
export function updateOtherPlayers(frames){
  for (let otherPlayer of otherPlayers.values()){
    otherPlayer.kill();
  }
  otherPlayers.clear();

  for (let playerId in frames){
    console.log(`${playerId} updated!`);
    let obj = frames[playerId];
    let frame = new EntityFrame(obj.x, obj.y, obj.t, [obj.dx, obj.dy], obj.eventCard);
    let ent = new Entity('Player', 0, frame);
    if(hash(playerId) > 0.5) ent.changeColor("#007700");
    else ent.changeColor("#000077");
    otherPlayers.add(ent);
    ent.updateHTMLElement();
  }
}
export class Collision extends EventCard{
  constructor(intersection, otherParent){
    super("collision", intersection.x, intersection.y, otherParent, "local", intersection.z);
  }
  asVector(){
    return new Point(this.a, this.b, 0);
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
  constrain(collision){ // constrain movement to the plane perpendicular to the vector
    let collisionVector = collision.asVector();
    // just in case
    collisionVector.z = 0;

    let movementVector = new Point(this.dx, this.dy, 0);
    try {
      movementVector.doSanityCheck();
      collisionVector.doSanityCheck();
    } catch (e) {
      console.log(movementVector);
      console.log(collisionVector);
      throw e;
    }
    

    if (movementVector.getDot(collisionVector) < 0) return this; // if theyre going in opposite directions, no need to correct it
    movementVector = movementVector.sub(movementVector.getProjOnto(collisionVector));

    this.dx = movementVector.x;
    this.dy = movementVector.y;

    return this;
  }
  addMovement(motionArr, isFlipped = false){
    this.dx += motionArr[0] * (isFlipped?-1:1);
    this.dy += motionArr[1] * (isFlipped?-1:1);
    return this;
  }
  zeroMotion(){
    this.dx = 0;
    this.dy = 0;
    return this;
  }
}


export class Entity {

  // type; // string representing the name of the type of entity
  // teamNum;
  // entity_bucket_index; // the entity bucket to which this entity belongs
  
 

  /**
   * I have been thinking about removing the current frame in favor of just getting the last item off of past frames.. but it could be helpful to change it to "next frame" as a sort of buffer...
   */
  // nextFrame; // might be possible to get rid of this, and just do .last() on the pastFrames array
  // frames; // array holding past frames for this Entity

  
  // time_paralellapiped;

  constructor(type = "npc", teamNum = 1, spawnFrame = new EntityFrame(0, 0, CURRENT_T, [0,0.2], null)) {
    const movementSpeed = 800;
    const projectileSpeed = 1000;
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

    switch(type){
      case "projectile":
        var scalar = 0.125;
        this.lifeSpan = setTimeout(() => {this.kill();}, 1500); 
        this.onCollision = [
          (myCollision, theirCollision) => theirCollision.obj.kill()
        ]; 
        break;
      case "block":
        var scalar = 1;
        this.onCollision = [
        ]; // normal physics action
        break;
      case "player":
        var scalar = 0.8;
        this.onCollision = [
          (myCollision, theirCollision) => myCollision.obj.handleCollision(theirCollision),
          // (myCollision, theirCollision) => theirCollision.obj.handleCollision(myCollision)
        ]; // normal physics action
        break;
      default:
        var scalar = 0.8;
        this.onCollision = [
          (myCollision, theirCollision) => myCollision.obj.handleCollision(theirCollision),
          // (myCollision, theirCollision) => theirCollision.obj.handleCollision(myCollision)
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

    this.movement_vectors = new Point(0,0,-1);
    this.movement_restirctions = []; // arr of all movement restrictions in the form of vectors, movement in the which direction is not allowed.
  
  }
  // tToFrameIndex(t){
  //   return Math.min(
  //     Math.floor(t / TIME_BETWEEN_FRAMES),
  //     this.pastFrames.length
  //   );
  // }
  addClass(htmlClass){
    this.element.classList.add(htmlClass);
  }
  kill(){
    entityBuckets[this.entity_bucket_index].delete(this);
    this.element.remove();
    delete this;
  }
  getMostRecentFrame(){
    return this.pastFrames.front();
  }
  getCoords(){
    return [this.pastFrames.front().x,this.pastFrames.front().y];
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

    this.cutFramesAfterT(newFrame.t); 
    this.nextFrame = newFrame;
    updateCurrentFrame(endT);
  }
  removeCollision(t){
    this.cutFramesAfterT(t);
  }
  cutFramesAfterT(t){ // returns all frames after (temporally) but not including the provided t 
    // cut off heads, return those frames
    // if (this.pastFrames.back().t >= t) throw Error("Cutting only frames! Did you try to collide with it right after creating it?");
    return this.pastFrames.split((frame) => frame.t < t);
    // while(pastFrames.front().t > t) {
    //   let oldFrame = pastFrames.popFront();
    //   let spawningEvent = oldFrame.EventCard;
    //   if (spawningEvent.type === "collision") spawningEvent.obj.removeCollision(oldFrame.t);
    // }
  }
  
  // getCollisionT(otherEntity) {
  //   return this.getModel().getIntersectionT(otherEntity.getModel());
  // }
  // getCollisionConstraint(otherEntity) {
  //   return this.getModel().getIntersectionCosntraint(otherEntity.getModel());
  // }
  
  
  
  // enactCollision(otherEntity, collision_t) { // collision of type EntityFrame
  //   let oldFrames = this.cutFramesAfterT(collision_t); 
  //   this.nextFrame = this.pastFrames.front().clone().projectTo(collision_t);
  //   this.pushNextFrame(); // might need changing bc nextFrame got repurposed from being currentFrame
    

    
  //   this.nextFrame = this.getFrameAt(collision_t);
  //   this.nextFrame.constrain(this.getCollisionConstraint(otherEntity));

  //   let otherEntity_new_path = otherEntity.getFrameAt(collision_t);
  //   otherEntity_new_path.constrain(otherEntity.getCollisionConstraint(this));

  //   otherEntity.affectPath(otherEntity_new_path); // this will handle the repercussions of an entity being knocked off-course. Note that the global temporal_front variable, is temporarily wrong about which entities are up-to-date. This fixes that asap.
  // }
  getModel(endTime = this.pastFrames.front().t, startFrame = this.pastFrames.at(1)) {
    let vector = new Point(startFrame.dx, startFrame.dy, endTime-startFrame.t);
    if (this.type === "player"){
      // console.log("< "+startFrame.t + " " +endTime+" > "+CURRENT_T);
      // console.log("> "+endTime);
    }
    if (startFrame.t >= endTime) {
      console.log("Begin Error Report");
      console.log(startFrame);
      console.log(endTime);
      throw Error("getModel(): the time to which to extend the frame must be after the time of the frame");
    }
    return new TimeParallelepiped(startFrame.x, startFrame.y, this.width, this.height, startFrame.t, endTime, vector); // build from current frame. look for a way to cache this
  }
  

  
  update(t = CURRENT_T) {
      if (t <= this.pastFrames.front().t) return;

      /** PROPOSE **/
      // sets nextFrame to the proposed move for the entity
      this.proposeMove(t);

      /** UPDATE **/
      // sets the current frame to nextFrame
      this.pushNextFrame(); 

      /** RATIFY **/
      // cleans up the mess
      if (doCollisions) this.ratifyNextFrame();
      
  }
  proposeMove(t = CURRENT_T){
    this.nextFrame = this.pastFrames.front().clone();
    this.nextFrame.projectTo(t);
  }
  pushNextFrame(){
    // check to see if frames are linear - that is, if the last frame presents no new information an hence can be discarded becuase the move remains implicit in the previous frame. This keeps a floating frame on the back that will always describe the msot recent state of things
    if ((this.pastFrames.length > 1 &&
    this.pastFrames.get(0).dx == this.pastFrames.get(1).dx &&
    this.pastFrames.get(0).dy == this.pastFrames.get(1).dy)){
      this.pastFrames.popFront();
    }
    this.pastFrames.pushFront(this.nextFrame);
    
      
    this.nextFrame = null;
  }
  ratifyNextFrame(){ // proposes frames, and handles collisions until the nextFrame is valid
    let result = this.checkForCollisions();
    // handles collisions up until current time, leaving nextFrame as the valid next frame
    if (result != null){
      let [thisCollision, otherCollision] = result; // first is this, second is other entity (see testCollisionWith(), about line 431..?)
      for(let action of this.onCollision){
        action(thisCollision, otherCollision); 
      }
    }
  }
   // eventually reroute to updateCurrentFrame, this is a lazy updateCurrentFrame for when i'm testing without collisions
  // updateCurrentFrame(t = CURRENT_T) {
  //   if (t !== this.pastFrames.front().t) return; // skip calculations if current frame already matches the current time
  //   const diffToLastFrame = t - this.pastFrames.front().t;

  //   const pastFramesIndx = tToFrameIndex(t);
  //   const diffToSavedFrame = t - pastFramesIndx * TIME_BETWEEN_FRAMES;

  //   let referenceFrame;
  //   if (diffToLastFrame >= 0 && diffToLastFrame <= diffToSavedFrame) {
  //     // develop current frame from most recent frame
  //     referenceFrame = this.pastFrames.front().clone(); // may or may not need to copy
  //   } else {
  //     // develop current frame from most recent frame
  //     referenceFrame = this.pastFrames.at(pastFramesIndx);
  //   }
  //   this.updateCurrentFrameFromFrame(referenceFrame);
  // }
  checkForCollisions(){ // tests the last pushed frame for colissions with entities in the relevant buckets in the temporal_front. Returns collision with lowest t
    // console.log("checking collisions for");
    let frstClsn = null;
    for (let i = 1; i < temporal_front.length; i++){
      if (i!=1 && i === this.entity_bucket_index) continue; // dont bother with collisions from entities on the same team (unless its in slot 1)
      for (let entity of temporal_front[i]){
        // console.log(this);
        // console.log(temporal_front);
        if (entity === this) continue; // don't interact with yourself
        if (this.type === "block" && entity.type === "block") continue;
        let clsn = this.testCollisionWith(entity);
        if (clsn != null && clsn[0].t == this.pastFrames.front().t) continue; // to avoid infinite loops when we start in a collision > is this the right way to do it though?  
        if (clsn != null && (frstClsn == null || clsn[0].t < frstClsn[0].t)) frstClsn = clsn;
      }
    }
    return frstClsn;
  }
  testCollisionWith(entity, t = CURRENT_T){ // returns the first collision DOES NOT WORK FOR NOT CURRENT TIMES
    if (t !== CURRENT_T) throw Error("testCollisionWith not yet implemented for times other than CURRENT_T");
    /* POSSIBLE TODO: test to make sure that entities overlap in time (this will be done by the model stuff too, so its not necessary) remember we could be testing a branch cut off from a previously developing collision */
    
    // console.log(this.pastFrames.front());
    let intersection = null;
    let framesToTest = entity.cutFramesAfterT(this.pastFrames.front().t);
    if (!entity.pastFrames.isEmpty()) framesToTest.pushBack(entity.pastFrames.popFront()); // becuase the previous frame either has a t of t, or covers t
    entity.pastFrames.joinFront(framesToTest);

    try {
      this.model = this.getModel(); //not yet implemented for times other than CURRENT_T
    } catch (e) {
      console.log("Begin Entity report");
      console.log(this);
      console.log(entity);
      console.log(this.pastFrames);
      console.log(entity.pastFrames);
      console.log(t);
      throw e;
    }
    let lastFrame = null;
    framesToTest.setIterateBackwards(); // flip the iterating direction so that we prioritize collisions in the past OPTOMIZE
    //make sure the frames end at t
    if (framesToTest.front().t > t) throw Error("The set of frames to test for interactions includes frames from after the targeted interaction time");
    // else if (framesToTest.front().t < t) console.log("ERROR: frames were not properly updated");
    // console.log(framesToTest);
    // console.log(entity.pastFrames);
    // testing each shape between frames
    for(let frame of framesToTest){
      
      if (lastFrame != null) {
        intersection = this.model.getIntersection(entity.getModel(frame.t, lastFrame));
        
        // console.log("trying intersection");
        // console.log(lastFrame);
        // console.log(intersection);
        
        if (intersection != null) {
          let collisions = [new Collision(intersection, this, true), new Collision(intersection, entity)];
          if (intersection == true){ // case of starting inside the object, or aligned with it - which can only happen if the object's future interesction was handled earlier
            this.collisionProcessPath(collisions[0]);
            entity.collisionProcessPath(collisions[1]);
            continue;
          } 
          // console.log("intersection!");
          // console.log(new Collision(intersection, entity), new Collision(intersection, this, true));
          // throw new Error();
          return collisions;
        }
      }
      lastFrame = frame;
    }
    // if (lastFrame != null) { // there is a danger of assuming that this frame extends into the present, it wont if the rest of the obejct got cut off
    //   intersection = this.model.getIntersection(entity.getModel(t, lastFrame));
    //   if (intersection != null) {
    //     console.log(entity);
    //     console.log(this);
    //     return [new Collision(intersection, entity), new Collision(intersection, this, true)];
    //   }
    // }

    return null;
  }











  handleCollision(collision, presentT = CURRENT_T){ // keeps track of its own buisness
    // console.log("handle collision");
    // console.log(this);

    this.nextFrame = this.pastFrames.front().clone().projectTo(collision.t); // cut the front frame down to size
    this.pushNextFrame();

    this.handleCollisionTree(collision, presentT);

    this.collisionProcessPath(collision, presentT);



    // console.log("done handling collision");
  }
  handleCollisionTree(collision, presentT){ // undoes any future collisions that may have happened
    let oldFrames = this.cutFramesAfterT(collision.t); 

    // cut off old collision trees
    let objsToRegrow = this.trimCollisionsFromCutFrames(oldFrames);

    for (let obj of objsToRegrow){
      obj.update(presentT); // alternativly, i could update it to at least where it was before.. that will lead to funky imaging as the imaging catches up though
    }


  }
  trimCollisionsFromCutFrames(oldFrames){ // returns a list of objects whose braches have been cut
    let objsWithCutBranches = new LinkedList();

    // check to see if any frames were a result of collisions, and notify the colliding object that the collision did not occur
    for (let oldFrame of oldFrames){
      if (oldFrame.EventCard == null) continue; // no event was associated with this frame
      let spawningEvent = oldFrame.EventCard;
      if (spawningEvent.obj == null) continue; // no obj was associated with this event
      let cutFrames = spawningEvent.obj.cutFramesAfterT(oldFrame.t);

      let objectsToAddToList = spawningEvent.obj.trimCollisionsFromCutFrames(cutFrames);
      objectsToAddToList.pushFront(spawningEvent.obj);

      objsWithCutBranches.join(objectsToAddToList);
    }

    return objsWithCutBranches;
  }
  collisionProcessPath(collision, presentT = CURRENT_T){
    this.nextFrame = this.pastFrames.front().clone();
    console.log(collision);
    console.log(collision.asVector());
    this.nextFrame = this.nextFrame.constrain(collision); // this is where the magic happens
    this.nextFrame.projectTo(presentT);
    this.pushNextFrame();
    this.ratifyNextFrame();
  }









  updateCurrentFrameFromFrame(referenceFrame, t = CURRENT_T) {
    while (this.pastFrames.front().t < t){
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
    eventCardDeque.pushFront(card);
  }
  getElement(){
    return this.element;
  }
  toggleKey(key, t = updateCurrentTime()){
    // relies on the correct state being in the movement vectors
    const thisKeyAction = this.actions[key]
    const isKeyPressed = !thisKeyAction.isPressed;
    this.actions[key].isPressed = isKeyPressed; // toggle whether its pressed
    
    this.handleAction(thisKeyAction, isKeyPressed, t);

    let card = new EventCard("user_input", key, isKeyPressed);
    this.eventCardDeque.pushFront(card);
  
  }
  handleAction(action, isDownStroke, t = updateCurrentTime()){
    const newFrame = this.pastFrames.front().clone().projectTo(t);

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
        this.update(t);
        this.nextFrame = newFrame;
        this.nextFrame.addMovement(action.coords, !isDownStroke);
        
        this.pushNextFrame(t);
        this.ratifyNextFrame();

        break;
      default:
        console.log("Error: undefined action type: "+action.type)
    }
  }
  updateHTMLElement(DEBUG = false){
    let currentFrame = this.pastFrames.front();
    if (DEBUG) console.log(this.type);
    if (DEBUG) console.log(this.pastFrames);
    if (DEBUG) console.log(currentFrame);
    const coords = convertCoords(currentFrame.x - this.width/2, currentFrame.y - this.height/2);
    this.element.style.left = coords[0] + "%";
    this.element.style.top = coords[1] + "%";
  };
};

//** END EXPORT STATEMENTS **//

function hash(str){
  var h = 0,
    i, chr;
  if (str.length === 0) return h;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    h = ((h << 5) - h) + chr;
    h |= 0; // Convert to 32bit integer
  }
  return h;
}