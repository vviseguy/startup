var GAME_START_T; // this variable will be set in game init.
// value of new Date().getTime() when the game starts.


class EventCard {
  constructor(type, coords, obj = null, origin = "local", eventT = new Date.getTime() - GAME_START_T) {
    this.type = type; // spawn, death, change in movement (collision is one of these)
    this.x = coords[0];
    this.y = coords[1];
    this.z = eventT;

    this.obj = obj; // pointer to obj

    this.origin = origin; // possibly useful for future debugging, helps differentiate keyboard input, vs collisions, vs server provided events
    
  }
}



class Entity {
  x;
  y;
  type
  vectors;
  constructor(x = 0, y = 0) {

  }
  getParalellapiped() {
    return new TimeParalellapiped(x, y, w, l, t1, t2, vector);
  }
}
class PlayerEntity extends Entity {
  vectors = {
    37: "moveLeft",
    38: "moveRight",
    39: [1, 0],
  }
  constructor(type) {
    super();
    this.type = type;
    this.element = document.createElement("div");
    this.element.classList.add("block");

    this.element.style.background = fuzzColor(myColors[type]);
  }

}

var blockTypes = {

}
var myColors = [
  "#918F8F", // black
  "#c4c4c4", // grey
  "#e6e6e6", // white
  // "#5432a8", // purple
  "#a38484" // red
  // "#37b8af", // teal

];


var EventDeque = LinkedList(); // contains event cards. haha get it, its a deque AND a deck

function fuzzColor(color, range = 40) {
  var fuzz = Math.random() * range;

  var r = fuzzHex(color.substring(1, 3), fuzz);
  var g = fuzzHex(color.substring(3, 5), fuzz);
  var b = fuzzHex(color.substring(5, 7), fuzz);

  return '#' + r + g + b;

  /* takes a two byte string with a hexadecimal value and 
    returns a two byte string that is a random amount off (up to the range)
  */
  function fuzzHex(hex, skew = Math.random() * range) {
    var hexAsInt = toInt(hex);
    hexAsInt += skew;
    return toHex(Math.round(createBound(hexAsInt)));
  }
  function createBound(num) {
    return (num < 0) ? 0 : (num > 255) ? 255 : num;
  }
}


/**
 * returns the hexadecimal value of a positive int > 0 and < 256
 */
function toHex(num) {
  var hexValues = '0123456789ABCDEF';
  return hexValues[Math.floor(num / 16)] + hexValues[Math.floor(num % 16)];
}

/**
 * 
 */
function toInt(string) {
  string = string.toUpperCase();
  var hexValues = '0123456789ABCDEF';
  var value = 0;
  for (var i = 0; i < string.length; i++) {
    value *= 16;
    value += hexValues.indexOf(string[i]);
  }
  return value;
}


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

window.onload = function() {
  
  for (var i = 0; i < 144; i++) {
    var nextBlock = new Entity(Math.floor(Math.random() * myColors.length));
    document.getElementById("gameEnv").appendChild(nextBlock.element);
  }

  testPhysics();
  testLinkedList();
  testPriorityQueue();
}

function beginGame(){
  setInterval(loop, 50);

  // debug auto reloader, reload every 60 seconds
  // setTimeout(() => { window.location.reload(); }, 30000);
  
  GAME_START = new Date().getTime();
}

// On collisions:
// (while the top of the priority queue of relevant solids ends before the next from the priority queue of listed movements, take it out of the stack)
// Project movement paralelapipeds [priority queue of listed movements(by the time coordinate of the bottom of the box) this actually may be a priority queue of cut solids to take from before the going to our spot in the vector of movements.. that makes more sense] > [priority queue of relevant solids(by the time coordinate of the top of the box)]
// -Scan the current paralelapiped for overlapping sides with the [priority queue of relevant solids] overlapping sides, mark the first point/line in time of the collision as a collision). Remember, we discard overlaps that include border lines on the top or bottom faces of solids iff the movement vectors point towards each other, (see the aside in “On generating new parallelepipeds after collisions”)
// -FOR SAID COLLISION: Apply movement rules/changes (here we would fix moving walls to stop when they pin the character against a bigger wall) for this collision
// -Split the two paralelapipeds (if necessary it is less efficient to just do both, but simpler), keep the concatenated ones in the relevancy queue. Put the split ends in the priority queue of listed movements (this begs the question of types.. do the paralelapipeds need to be a separate object? This may help with caching and memory, but JS is so chaotic and non-in order that it may not matter.. this may BE A QUESTION FOR DAD.
// Repeat while solids remain in the queue of listed movements.
// On detecting overlapping solids
// 	=check to see if two bottom points (one from each shape) are within the sum of diagonals of the objects plus the maximum movement of each solid (this is an easy test to show that two shapes aren’t anywhere near touching each other).
// 	= (I don’t think it matters whether they start colliding)
// 	=check each combination of two lateral faces - one from each solid in the following way:
// -	Easiest math way seems to make a plane in standard form for one face, and calculate the constant for each point and if one point goes from one side (of the correct constant for the equation) to another then there may be a collision – but not necessarily. (If one point goes over, the collision may only be a point, if both, then the collision will be a line perpendicular to the time axis (because the parallelepiped top and bottom faces are perpendicular to the time axis)).
// o	Now that we know a collision is possible, you only need to find the time at which the collision point or points cross the standard form plane (this can be done by writing the plane in the form of a function of t and solving for t. I don’t know exactly what that will be but this is how you will find the equation to program in.)
// o	Double check that the one/two points at the time slice actually lie on the other shape (and not both the same direction off of one of the sides).. this may be a bit difficult.
// o	Return the right type of collision based on the collision being a line collision or a point collision. (format unknown)
// On generating new parallelepipeds after collisions.
// 	Wall blocks do not generate new parallelepipeds.
// 	Entity parallelepipeds end as soon as the wall does (do entities even collide?)… I could make a listener to trigger their separation if entities do collide.. or just test the collision every frame.
// 	Wall-entity collisions disallow movement in the direction perpendicular to both the collision line and the time axis. (could create entity state for locked directions of movement..) resulting vectors based on the input are generated from this and the new parallelepiped is generated. Resulting vectors are projections in the plane perpendicular to the collision
// 	ASIDE: There is a problem of colliding with a wall, letting go of the offending key, and the pressing it again (for any entity) and continuing in that direction, generating a new parallelepiped in that direction, that will not collide. >>> resolved?? >>> Maybe in the case of top or bottom face collisions, you ignore iff the paralelepipeds go towards each other or farther apart (via the directions of the movement vectors)

// On Synchronizing:
// 	If I trust that all objects are in the right place… do I need to fix it??? I guess for the sake of debugging… huh well the primary sync thing will be:
// 	Movement:
// 		Each player will have a linked list of all game events (deletion could be done by server after a certain amount of time to allow for packets getting lost/being late.. though a rejected packet for being so late is a possibility in which case the other game would recalculate from the deleted packets position… no… that wouldn’t work.. because that would be after that person deleted some other thr “past” packets… hm. Maybe they just resync everything then.. or we just hope it doesn’t happen.
// 		Lets just keep all the movements for now.. this will be in the form of [key, start time, end time]. End time is null until defined otherwise.. or -1?? Hm idk..
// 		Should this be generalized to all events?? No coordinating the “random” events should be sufficient for that.. THIS IS AN AREA THAT WILL REQUIRE THOROUGH TESTING THOUGH… so much is reliant on spawning things in at the same time, so that we know that both players are working with the same screen.

