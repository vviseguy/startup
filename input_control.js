export function addListeners(elementId, keyCode, funct){
    addKeyListeners(keyCode, funct);
    addMouseListeners(elementId, keyCode, funct);
}

function addKeyListeners(keyCode, funct){
    var isPressed = false;

    function makeKeyDownListener() {
        document.addEventListener('keydown', (event) => {
            var code = event.code;
            if (code == keyCode && !isPressed){
                isPressed = true;
                funct(keyCode);
            } 
        });
    }

    function makeKeyUpListener() {
        document.addEventListener('keyup', (event) => {
            var code = event.code;
            if (code == keyCode && isPressed){
                isPressed = false;
                funct(keyCode);
            }
        });
    }

    makeKeyDownListener();
    makeKeyUpListener();
  }
function addMouseListeners (elementId, keyCode, funct){
    const element = document.getElementById(elementId);
    var isPressed = false;

    function makeMouseDownListener() {
        element.addEventListener("mousedown", () => {
            if (!isPressed){
                isPressed = true;
                funct(keyCode);
            } 
        });
    }

    function makeMouseUpListener() {
        document.addEventListener("mouseup", () => {
            if (isPressed){
                isPressed = false;
                funct(keyCode);
            }
        });
    }

    makeMouseDownListener();
    makeMouseUpListener();
}