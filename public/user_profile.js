
export class User {
    record = {
        gamesPlayed:0,
        gamesWon:0,
        gamesLost:0
    }
    backgroundColor = "#DD1111";
    profilePictureLocation = "https://www.stockphotosecrets.com/wp-content/uploads/2018/08/hide-the-pain-stockphoto-840x560.jpg";
    constructor(username){
        this.username = username;
    }

    setPassword(password){
        this.passwordHash = hashPassword(password);
    }
    hashPassword(password){
        password = ":) lets add some salt to these hashbrowns" + String(password);
        
        // simple hash from https://stackoverflow.com/a/7616484
        var hash = 0,
            i, chr;
        if (password.length === 0) return hash;
        for (i = 0; i < password.length; i++) {
            chr = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
    verifyCredential(username, password){
        return this.username === username && this.passwordHash === hashPassword(password);
    }

    // returns this object (minus info they shouldnt have readily) as a JSON string
    getJSON(){
        const cpy = Object.assign(target, source);
        delete cpy.passwordHash;
        return JSON.stringify(cpy);
    }

    getAccessToken(){ // not secure but itll do
        this.accessToken = generateRandomString(16);
        return this.accessToken;
    }
    checkAccessToken(candidateMatchToken){
        return this.accessToken === candidateMatchToken;
    }
}

// adapted from https://stackoverflow.com/a/1349426
function generateRandomString(length){
    let result = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const alphabetSize = alphabet.length;
    for (var i = 0; i < length; i++) {
        result += alphabet.charAt(Math.floor(Math.random() * alphabetSize));
    }
    return result;

}