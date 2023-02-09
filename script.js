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


// window.onload = function() {
//   loadScripts();
  

// }

// function loadScripts(){
//   var directory = 'javascripts/';
//   var extension = '.js';
//   var files = [
//     'dataStructures/LinkedList', 
//     'dataStructures/PriorityQueue', 
//     'collisions_and_solids',
//     'color_tools',
//     'entity',
//     'event_processing'
//   ];  
//   for (var file of files){ 
//       var path = directory + file + extension; 
//       var script = document.createElement("script");
//       script.src = path;
//       document.body.appendChild(script);
//   } 
// }
