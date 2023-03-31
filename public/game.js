import { updateEntities, jostleEntities, adjustFrame, Entity, EntityFrame} from "./javascripts/Entity.js";
import { EventCard } from "./javascripts/EventCard.js";
import { connectGame } from "./javascripts/server_connection.js";
import { LinkedList } from "./javascripts/dataStructures/LinkedList.js";
import { myColors } from "./javascripts/color_tools.js";
import { addListeners} from "./input_control.js";
import { GAME_BOARD_TEXT } from "./game_board.js";

let GAME_START_T; // this variable will be set in game init.
export let CURRENT_T;
// value of new Date().getTime() when the game starts.

const MS_BETWEEN_FRAMES = 50;


export const GAME_ENV = document.getElementById("gameFrame");
const GAME_BOARD_FILE = "./game_board.txt";

export const BOARD_TILE_WIDTH = 70;
const THE_FIRST_SPINJITSU_MASTER = new EventCard("game_creation",3.1415,42);
export let PLAYER_ENT;


function loadGame(){
  
  GAME_START_T = updateCurrentTime();
  
  generateGameBoard(GAME_BOARD_TEXT);

  const toggleFunct = (k) => {PLAYER_ENT.toggleKey(k);};
  addListeners('l-u-arw', 'KeyW', toggleFunct);
  addListeners('l-r-arw', 'KeyD', toggleFunct);
  addListeners('l-l-arw', 'KeyA', toggleFunct);
  addListeners('l-d-arw', 'KeyS', toggleFunct);

  addListeners('r-u-arw', 'ArrowUp'   , toggleFunct);
  addListeners('r-r-arw', 'ArrowRight', toggleFunct);
  addListeners('r-l-arw', 'ArrowLeft' , toggleFunct);
  addListeners('r-d-arw', 'ArrowDown' , toggleFunct);

  
  // for (let i = 0; i < 144; i++) {
  //   let nextBlock = new Entity("block",0);
  //   GAME_ENV.appendChild(nextBlock.element);
  // }
}

function generateGameBoard(game_board_text){
  let x = 0;
  let y = 0;
  for (let c of game_board_text){
    let nextFrame = new EntityFrame(x,y, GAME_START_T,[0,0],THE_FIRST_SPINJITSU_MASTER);
    let nextBlock;
    switch(c){
      case '#':
        nextBlock = new Entity("block", -1, nextFrame); 
        break;
      case '-':
        nextBlock = new Entity("block", -2, nextFrame); 
        nextBlock.changeColorUsingPreset(2);
        break;
      
      case '\n':
        x = 0;
        y += BOARD_TILE_WIDTH;
        continue;
      case 'x':
        PLAYER_ENT = new Entity("player", 1, new EntityFrame(x,y, GAME_START_T ,[0,0],THE_FIRST_SPINJITSU_MASTER));
        PLAYER_ENT.changeColor("#770000");
      case ' ':
      default:
        nextBlock = new Entity("block", -2, nextFrame); 
        break;
    }
    
    x += BOARD_TILE_WIDTH;
  }
  jostleEntities();
}
let gameLoop;
let scheduledGameEnd;

let ALREADY_LOADED = false; // a temporay fix! change pls

export function beginGame(){
  if (!ALREADY_LOADED) {
    loadGame();
    ALREADY_LOADED = true;

  }
  if (endGame() && connectGame()) {
    doFrame();
    gameLoop = setInterval(doFrame, MS_BETWEEN_FRAMES);

    // shut off the game after 500 ms
    scheduledGameEnd = setTimeout(endGame, 60000); 
  } else throw new Error("Could not connect game to server.");

  



}

export function updateCurrentTime(){
  CURRENT_T = new Date().getTime();
  // console.log("t: "+CURRENT_T);
  return CURRENT_T;
}

window.beginGame = beginGame;
function endGame(){
  clearTimeout(scheduledGameEnd);
  clearInterval(gameLoop);
  return true;
}



function doFrame(){
  updateCurrentTime(); // time coord for this frame
  updateEntities(); // move entities to current positions, handle collisions
  adjustFrame();
}
// On collisions:
// (while the top of the priority queue of relevant solids ends before the next from the priority queue of listed movements, take it out
// of the stack)

// Project movement paralelapipeds [priority queue of listed movements(by the time coordinate of the bottom of the box) this actually 
// may be a priority queue of cut solids to take from before the going to our spot in the vector of movements.. that makes more sense] > 
// [priority queue of relevant solids(by the time coordinate of the top of the box)]

// -Scan the current paralelapiped for overlapping sides with the [priority queue of relevant solids] overlapping sides, mark the first 
// point/line in time of the collision as a collision). Remember, we discard overlaps that include border lines on the top or bottom 
// faces of solids iff the movement vectors point towards each other, (see the aside in “On generating new parallelepipeds after 
// collisions”)

// -FOR SAID COLLISION: Apply movement rules/changes (here we would fix moving walls to stop when they pin the character against a 
// bigger wall) for this collision

// -Split the two paralelapipeds (if necessary it is less efficient to just do both, but simpler), keep the concatenated ones in the 
// relevancy queue. Put the split ends in the priority queue of listed movements (this begs the question of types.. do the 
// paralelapipeds need to be a separate object? This may help with caching and memory, but JS is so chaotic and non-in order that it 
// may not matter.. this may BE A QUESTION FOR DAD.

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

