
var HOME_PAGE_ID = "home";
var HEADER_ID = "header";
var ERROR_PAGE_ID = "error";

function changePage(targetPageId) {
  // hide all pages
  const allPages = document.getElementsByClassName("page");

  for (var i = 0; i < allPages.length; i++) {
    allPages[i].classList.add("hidden");
  }

  // unhide the target page
  const targetPage = document.getElementById(targetPageId);

  // hide the header for the home page
  if (targetPageId == HOME_PAGE_ID)
    document.getElementById(HEADER_ID).classList.add("hidden");
  else 
    document.getElementById(HEADER_ID).classList.remove("hidden");

  // if page DNE, go to error page
  if (targetPage) 
    targetPage.classList.remove("hidden");
  else 
    document.getElementById(ERROR_PAGE_ID).classList.remove("hidden");
}


window.onload = function() {
  // loadGame();
  
  // debug auto reloader, reload every 60 seconds
  // setTimeout(() => { window.location.reload(); }, 30000);
}

