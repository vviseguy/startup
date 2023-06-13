import { username } from "./credentials.js";
import { Game } from "./game.js";
import { beginGame, PLAYER_ENT, startTimeAtTEquals, clearGame} from "../load_game.js";

export let offline = true;

export let currentGame = null;
// place holder function for connecting to the server
export async function connectGame(gameId){
    console.log(`Trying to connect to game "${gameId}"`);
    return awaitcd
}

export async function createGame() {
    console.log("sending request to create game");
    return await fetch('/api/game/create', {
        method: 'POST', 
        body: JSON.stringify({
            player: username
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Accept': "application/json"
        }})
        .then((res) => res.json())
        .then((json) => {
            console.log(`Creating game with id: ${json.gameId}`);
            currentGame = new Game(json.gameId);
            offline = false;
            return json.gameId;
        })
        .catch((error) => {console.log(error)});
}
export async function pushPullFrames() {
    if (currentGame == null) return;
    return await fetch(`/api/game/update/${currentGame.id}`, {
        method: 'POST',
        body: JSON.stringify({ 
            player: username, 
            frame: PLAYER_ENT.getMostRecentFrame() 
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
          }
    })
    .then((obj) => {
        console.log(obj);
        // console.log(JSON.parse(obj))
        return obj.json();
    })
    .then((json) => {
        console.log(json);
        return json; 
    });
}

document.getElementById("createGame").addEventListener("click", async ()=>{
    const gameCode = await createGame();
    clearGame();
    updateGameId(gameCode);
    
    startTimeAtTEquals(0);
    beginGame();
    changePage('play-game');
    
});
document.getElementById("joinGame").addEventListener("click", async ()=>{
    const gameCode = document.getElementById("gameJoinCode").value;
    const startT = await connectGame(gameCode);
    clearGame();
    updateGameId(gameCode);
    
    startTimeAtTEquals(startT);
    beginGame();
    changePage('play-game');
});

function updateGameId(newGameId){
    console.log("UPDATEGAMEID");
    let gameIdEls = document.getElementsByClassName("currentGameIdHolder");
    console.log("UPDATEGAMEID");
    for (let el of gameIdEls){
        if (offline && el.tagName !== "input") el.innerText = "Offline";
        else el.innerText = newGameId;
    }
}
// note to self, when registering events that happen back in time, from the current time, make sure that all items are loaded into the temporal front (and hecne up to date) before affecting one of the entitites