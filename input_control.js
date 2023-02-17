export var addKeyListeners = (keyCode, funct) => {
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