
const HOME_PAGE_ID = "home";
const HEADER_ID = "header";
const ERROR_PAGE_ID = "error";
const GAME_START_ID = "play-game";
const LAST_PAGE_SHORTCUT = "%last-page";


let lastPageStack = [];

function changePage(newPageId) {
  let targetPageId = newPageId;
  
  // hide last viewed page
  if (lastPageStack.length > 0) {
    let lastViewedPage = lastPageStack[lastPageStack.length-1];
    document.getElementById(lastViewedPage).classList.add("hidden");
  }

  if (targetPageId == LAST_PAGE_SHORTCUT){
    if (lastPageStack.length > 0) lastPageStack.pop();
    if (lastPageStack.length > 0) {
      targetPageId = lastPageStack.pop();
    } else
      targetPageId = HOME_PAGE_ID;
  }

  // hide all pages
  // const allPages = document.getElementsByClassName("page");

  // unhide the target page
  const targetPage = document.getElementById(targetPageId);

  // hide the header for the home page
  if (targetPageId == HOME_PAGE_ID)
    document.getElementById(HEADER_ID).classList.add("hidden");
  else 
    document.getElementById(HEADER_ID).classList.remove("hidden");

  if (targetPageId == GAME_START_ID)
    beginGame();

  // if page DNE, go to error page
  if (targetPage) 
    targetPage.classList.remove("hidden");
  else 
    document.getElementById(ERROR_PAGE_ID).classList.remove("hidden");

  lastPageStack.push(targetPageId);
  console.log(lastPageStack);

}


window.onload = function() {
  changePage("home");
  // loadGame();
  
  // debug auto reloader, reload every 60 seconds
  // setTimeout(() => { window.location.reload(); }, 30000);
}
