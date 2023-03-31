export function addListeners(elementId, keyCode, funct){
    addKeyListeners(keyCode, funct);
    addMouseAndTouchListeners(elementId, keyCode, funct);
}

function addKeyListeners(keyCode, funct){
    let isPressed = false;

    function makeKeyDownListener() {
        document.addEventListener('keydown', (event) => {
            let code = event.code;
            if (code == keyCode && !isPressed){
                isPressed = true;
                funct(keyCode);
            } 
        });
    }

    function makeKeyUpListener() {
        document.addEventListener('keyup', (event) => {
            let code = event.code;
            if (code == keyCode && isPressed){
                isPressed = false;
                funct(keyCode);
            }
        });
    }

    makeKeyDownListener();
    makeKeyUpListener();
  }


/** the touch sensing lags a little on the phone, perhaps it is because there is intense work going on drawing the touch circles, but maybe this function could be improved */
function addMouseAndTouchListeners (elementId, keyCode, funct){
    const element = document.getElementById(elementId);
    let numTouchPoints = 0;

    function makeMouseDownListener() {
        element.addEventListener("mousedown", () => {
            console.log("mousedown");
            if (numTouchPoints == 0){
                funct(keyCode);
            } 
            numTouchPoints++;
        });
    }

    function makeMouseUpListener() {
        document.addEventListener("mouseup", () => {
            console.log("mouseup");
            if (numTouchPoints > 0){
                numTouchPoints--;
                funct(keyCode);
            }
        });
    }



    function makeTouchDownListener() {
        element.addEventListener("touchstart", () => {
            console.log("touchbegin");
            if (numTouchPoints == 0){
                funct(keyCode);
            } 
            numTouchPoints++;
        });
    }

    function makeTouchUpListener() {
        document.addEventListener("touchend", () => {
            console.log("touchend");
            if (numTouchPoints > 0){
                numTouchPoints--;
                funct(keyCode);
            }
        });
    }

    makeMouseDownListener();
    makeMouseUpListener();
    
    makeTouchDownListener();
    makeTouchUpListener();
}
