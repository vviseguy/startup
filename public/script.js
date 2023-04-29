

const HOME_PAGE_ID = "home";
const HEADER_ID = "header";
const ERROR_PAGE_ID = "error";
const GAME_START_ID = "play-game";
const LAST_PAGE_SHORTCUT = "%last-page";

const DEFAULT_PAGE_TITLE = "[Game Title]";

let lastPageStack = [];



function changePage(newPageId, useHistory = true) {
  if (newPageId == "") newPageId = HOME_PAGE_ID;
  let targetPageId = newPageId;
  
  // hide all visible pages
  let visiblePages = document.getElementsByClassName("visible");
  while (visiblePages.length > 0) {
    let page = visiblePages[0];
    console.log(page);
    // console.log(document.getElementsByClassName("visible"));
    console.log("hiding this page: "+page.classList[page.classList.length -1]);
    toggleHidden(page,"hidden");
    console.log("the page is now: " + page.classList[page.classList.length -1]);
  }

  // ~~ OUTDATED WITH HISTORY MOZ THING ~~
  // if (targetPageId == LAST_PAGE_SHORTCUT){
  //   if (lastPageStack.length > 0) lastPageStack.pop();
  //   if (lastPageStack.length > 0) {
  //     targetPageId = lastPageStack.pop();
  //   } else
  //     targetPageId = HOME_PAGE_ID;
  // }

  // hide all pages
  // const allPages = document.getElementsByClassName("page");

  // unhide the target page

  // hide the header for the home page
  if (targetPageId == HOME_PAGE_ID)
    toggleHidden(document.getElementById(HEADER_ID),"hidden");
  else 
    toggleHidden(document.getElementById(HEADER_ID),"visible");

  // if (targetPageId == GAME_START_ID)
  //   beginGame(); // add back window.beginGame = beginGame; somewhere in that file

  // if page DNE, go to error page
  
  const targetPage = document.getElementById(targetPageId);

  // default to Error page when page DNE
  if (!targetPage) targetPage = document.getElementById(ERROR_PAGE_ID); 
  
  if (targetPage.title !== "") document.title = targetPage.title;
  else document.title = DEFAULT_PAGE_TITLE;
  toggleHidden(targetPage,"visible");


  if (useHistory) lastPageStack.push(targetPageId);
  console.log(lastPageStack);

  
  if (useHistory) history.pushState(null, "", newPageId);
  console.log(history);
}


window.onload = async function() {
  changePageToUrl("home");
  await updateDadJoke();
  // loadGame();
  
  // debug auto reloader, reload every 60 seconds
  // setTimeout(() => { window.location.reload(); }, 30000);
}

async function updateDadJoke(){
  let el = document.getElementById("dadJoke");
  el.innerHTML = await fetch("https://icanhazdadjoke.com/",{
    method: "GET",
    headers: {
      Accept: "application/json",
    }
  })//.then((res) => res.json())
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      return `"${json.joke}"\n\n<div style="margin: 5px; text-align: right;">-icanhazdadjoke.com</div>`;
    });
}

function changePageToUrl(def = "error", useHistory = true){
  const url = window.location.href;
  let page = def;
  if (url.lastIndexOf('/') < url.length) page = url.substring(url.lastIndexOf('/')+1);
  changePage(page, useHistory);
}

window.addEventListener("popstate", (event) => {
  console.log("popstate");
  console.log(lastPageStack);
  changePageToUrl("error",false);
  
  lastPageStack.pop();
  console.log(lastPageStack);
});

function toggleHidden(element, state){
  if (state === "hidden"){
      element.classList.add("hidden");
      element.classList.remove("visible");
  }
  else{
      element.classList.remove("hidden");
      element.classList.add("visible");
  }
}