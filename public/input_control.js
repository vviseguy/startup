let listeners = [];

export function addListeners(elementId, keyCode,  listenerFunct){
    addKeyListeners(keyCode,  listenerFunct);
    addMouseAndTouchListeners(elementId, keyCode,  listenerFunct);
}

function addKeyListeners(keyCode, funct){
    let isPressed = false;

    function makeKeyDownListener() {
        let listenerFunct = (event) => {
            let code = event.code;
            if (code == keyCode && !isPressed){
                isPressed = true;
                funct(keyCode);
            } 
        };
        pushEventListener(document,"keydown", listenerFunct);
    }

    function makeKeyUpListener() {
       let listenerFunct = (event) => {
            let code = event.code;
            if (code == keyCode && isPressed){
                isPressed = false;
                funct(keyCode);
            }
        };
        pushEventListener(document,"keyup", listenerFunct);
    }

    makeKeyDownListener();
    makeKeyUpListener();
  }


/** the touch sensing lags a little on the phone, perhaps it is because there is intense work going on drawing the touch circles, but maybe this function could be improved */
function addMouseAndTouchListeners (elementId, keyCode, funct){
    const element = document.getElementById(elementId);
    let numTouchPoints = 0;

    function makeMouseDownListener() {
        let listenerFunct = () => {
            console.log("mousedown");
            if (numTouchPoints == 0){
                funct(keyCode);
            } 
            numTouchPoints++;
        };
        pushEventListener(element,"mousedown", listenerFunct);
    }

    function makeMouseUpListener() {
        let listenerFunct = () => {
            console.log("mouseup");
            if (numTouchPoints > 0){
                numTouchPoints--;
                funct(keyCode);
            }
        };
        pushEventListener(document,"mouseup", listenerFunct);
    }



    function makeTouchDownListener() {
        let listenerFunct = () => {
            console.log("touchbegin");
            if (numTouchPoints == 0){
                funct(keyCode);
            } 
            numTouchPoints++;
        };
        
        pushEventListener(element,"touchstart", listenerFunct);
    }

    function makeTouchUpListener() {
        let listenerFunct = () => {
            console.log("touchend");
            if (numTouchPoints > 0){
                numTouchPoints--;
                funct(keyCode);
            }
        };
        pushEventListener(document,"touchend", listenerFunct);
    }

    makeMouseDownListener();
    makeMouseUpListener();
    
    makeTouchDownListener();
    makeTouchUpListener();
}

function pushEventListener(element, eventStr, listenerFunct){
    console.log("adding event listener for "+eventStr);
    element.addEventListener(eventStr, listenerFunct);
    listeners.push({obj:element, event:eventStr, do:listenerFunct});
}
export function removeAllInputListeners(){
    while (listeners[0]){
        let listener = listeners.pop();
        console.log("removing event listener for "+listener.event);
        listener.obj.removeEventListener(listener.event, listener.do);
    }
}