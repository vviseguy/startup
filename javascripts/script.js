var HOME_PAGE_ID = "home";
var HEADER_ID = "header";
var ERROR_PAGE_ID = "error";

function changePage(targetPageId) {
  // hide all pages
  var allPages = document.getElementsByClassName("page");

  for (var i = 0; i < allPages.length; i++) {
    allPages[i].classList.add("hidden");
  }

  // unhide the target page
  var targetPage = document.getElementById(targetPageId);

  if (targetPageId == HOME_PAGE_ID)
    document.getElementById(HEADER_ID).classList.add("hidden");
  else document.getElementById(HEADER_ID).classList.remove("hidden");

  if (targetPage) targetPage.classList.remove("hidden");
  else document.getElementById(ERROR_PAGE_ID).classList.remove("hidden");
}
