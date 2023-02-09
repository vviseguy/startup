export class EventCard {
    constructor(type, coords, obj = null, origin = "local", eventT = new Date.getTime()) {
      this.type = type; // string of spawn, death, change in movement (collision is one of these)
      
      // do we need these or can we use other things here?
      this.x = coords[0];
      this.y = coords[1];
  
      this.z = eventT;
  
      this.obj = obj; // pointer to entity which the card represents
  
      this.origin = origin; // string indicating the generating environment, possibly useful for future debugging, helps differentiate keyboard input, vs collisions, vs server provided events
      
    }
}
  