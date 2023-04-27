const config = require("./game.js");

const MAX_ACTIVE_GAMES = 10;
let activeGames = new Map();


function generateNewGame(){
    if (activeGames.size >= MAX_ACTIVE_GAMES) throw Error("Too many games. Cannot add game.");

    let game = new Game();
    while (activeGames.has(game.id)) game.regenerateId(); // get unique id;
    activeGames.set(game.id, game);

    return game.id;
}
function getGameById(gameId){
    return activeGames.get(gameId);
}
function isActiveGameId(gameId){
    return activeGames.has(gameId);
}
function addGame(game){
    if (activeGames.size >= MAX_ACTIVE_GAMES) throw Error("Too many games. Cannot add game.");

    if (activeGames.has(game.id)) throw Error("A game with this ID is already active.");
    activeGames.set(game.id, game);
}
function removeGame(game){
    if (!activeGames.has(game.id)) throw Error("No matching active game.");
    
    activeGames.delete(game.id);
}


module.exports = { generateNewGame, getGameById, isActiveGameId, addGame, removeGame};