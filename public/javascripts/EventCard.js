import { CURRENT_T } from "../game.js";
export class EventCard {
    constructor(type, a, b, obj = null, origin = "local", eventT = CURRENT_T) {
      this.type = type; // string of spawn, death, user_input, collision
      
      // do we need these or can we use other things here?
      // in case of spawn, a and b are coordinates
      // in case of keystroke, a is the key, b is a boolean for if the keystroke is starting
      this.a = a;
      this.b = b;
  
      this.t = eventT;
  
      this.obj = obj; // pointer to entity which the card represents
  
      this.origin = origin; // string indicating the generating environment, possibly useful for future debugging, helps differentiate keyboard input, vs collisions, vs server provided events
      
    }
}
  