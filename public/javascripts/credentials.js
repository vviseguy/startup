export let username = "Guest";

document.getElementById("signIn").addEventListener("click",() => {
    authenticate()
        .then(() => {
            changePage("account-dashboard");
        });
})

async function authenticate(str){
    username = document.getElementById("username").value;
    document.getElementById("playerId").innerText = username;
}