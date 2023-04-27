import { username } from "./credentials.js";
import { Game } from "./game.js";
import { PLAYER_ENT } from "../load_game.js";
export let currentGame = null;
// place holder function for connecting to the server
export async function connectGame(gameId){
    console.log(`Trying to connect to game ${gameId}`);
    fetch(`/api/game/join/${gameId}`, {
        method: 'POST',
        body: JSON.stringify({
            player: username
        })})
        .then(() =>{currentGame = new Game(gameId);})
        .then(() =>{changePage('play-game');})
        .catch((error) => {console.log(error)});
}

export async function createGame() {
    console.log("sending request to create game");
    await fetch('/api/game/create', {method: 'POST'})
        .then((res) => {
            let j =  res.json();
            console.log(j);
            return j;
        })
        .then((res) =>{
            console.log(`create respons`);
            
            console.log(res);
            console.log(res.body);
            currentGame = new Game(gameId);
        })
        .then(() =>{changePage('play-game')})
        .catch((error) => {console.log(error)});
}
export async function pushPullFrames() {
    if (currentGame == null) return;
    
    await fetch(`/api/game/update/${currentGame.gameId}`, {
        method: 'POST',
        body: JSON.stringify({
            player: username,
            frame: PLAYER_ENT.getMostRecentFrame()
        })
    })
    .then((obj) => {
        console.log(obj);
        return JSON.parse(obj); 
    });
}

document.getElementById("createGame").addEventListener("click", ()=>{
    createGame();
});
document.getElementById("joinGame").addEventListener("click", ()=>{
    const gameCode = document.getElementById("gameJoinCode").value;
    console.log(`printing gameJoinCode ${gameCode}`)
    connectGame(gameCode);
});
// note to self, when registering events that happen back in time, from the current time, make sure that all items are loaded into the temporal front (and hecne up to date) before affecting one of the entitites