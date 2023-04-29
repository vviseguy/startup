class Game {
    players = new Map();
    headPlayer;
    constructor(id = generateRandomString(6)){
        this.id = id;
    }
    regenerateId(){
        this.id = generateRandomString(6);
    }
    hasPlayer(player){
        return this.players.has(player);
    }
    addPlayer(player){
        if (!this.headPlayer) this.headPlayer = player;
        // this.players.set(player, null);
    }
    removePlayer(player){
        this.players.delete(player);
    }
    asInfo(){
        return {
            gameId: this.id,
            numPlayers: this.players.size()
        };
    }
    updateFrame(player, frame){
        if (!this.players.has(player)) {
            console.log("No matching player.");
            console.log(player);
            console.log(this.players);
            // throw Error("No matching player.");
        }
        this.players.set(player, frame);
    }
    getCurrentFrames(){ // returns the most recent frame of all other players
        let obj = Object.fromEntries(this.players);
        delete obj[this.id];
        return JSON.stringify(obj);
    }
    getTime(){
        return this.players.get(this.headPlayer).t;
    }
}

const GAME_CODE_ALPHABET = "0123456789";
function generateRandomString(length, alphabet = GAME_CODE_ALPHABET){
    let str = "";
    const alphabetLength = alphabet.length;
    for (let i = 0; i < length; i++)
        str += alphabet[Math.floor(Math.random() * alphabetLength)];
    return str;
}

module.exports = {Game};