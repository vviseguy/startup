export class Game {
    players = new Map();
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
        if (!this.players.has(player)) throw Error("No matching player.");
        this.players.set(player, frame);
    }
    getCurrentFrames(){ // returns the most recent frame of all other players
        let obj = Object.fromEntries(this.players);
        delete obj[this.id];
        return JSON.stringify(obj);
    }
}

const GAME_CODE_ALPHABET = "Il1";
function generateRandomString(length, alphabet = GAME_CODE_ALPHABET){
    let str = "";
    const alphabetLength = alphabet.length;
    for (let i = 0; i < length; i++)
        str += alphabet[Math.floor(Math.random() * alphabetLength)];
    return str;
}