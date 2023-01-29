var HOME_PAGE_ID = "home";


function changePage(targetPageId) {
  // hide all pages
  var allPages = document.getElementsByClassName("page");

  for (var i = 0; i < allPages.length; i++) {
    allPages[i].classList.add("hidden");
  }

  // unhide the target page
  var targetPage = document.getElementById(targetPageId);
  
  if (targetPage)
    targetPage.classList.remove("hidden");
  else
    document.getElementById(HOME_PAGE_ID).classList.remove("hidden");
}
