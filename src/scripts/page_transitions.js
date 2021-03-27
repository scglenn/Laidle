






//   ..---..
//  /       \
// |         |
// :         ;
//  \  \~/  /
//   `, Y ,'
//    |_|_|
//    |===|
//    |===|
//     \_/
//
// INVESTIGATE: what different ways can i include a javascript function from another file?
// Looks like there are some APIs available, will those work for a chrome extension?
// Otherwise i can make globals. Is that fine for page transitions tho?
// https://stackoverflow.com/questions/31030013/sharing-js-functions-between-files-without-making-them-global-or-attaching-them/31030202
// https://www.sitepoint.com/understanding-es6-modules/
function initializeAnimation()
{
    document.addEventListener("DOMContentLoaded", () => setTimeout(fadeInUpAnimation, 100));
}

function fadeInUpAnimation()
{
    var obj = document.getElementById('mainMenu');
    
    obj.setAttribute("class", "slideUp");
    setTimeout(enableScroll,1000);
    
}

function fadeOutDownAnimation(transition_page_name)
{
  disableScroll();

  var obj = document.getElementById('mainMenu');
  
  obj.removeAttribute("class", "slideUp");
  obj.setAttribute("class","fadeOut");


  setTimeout(function() {transitionPageTo(transition_page_name)},250);
}    

function transitionPageTo(transition_page_name)
{  
  window.location.href=transition_page_name;
  
  //Store the page that is going to be loaded after losing focus
  chrome.storage.sync.set({page_on_load: transition_page_name}, function(){
      console.log("page on load is " + transition_page_name);
  });

}

function enableScroll()
{
  var obj = document.getElementsByTagName('body')[0];
  var obj2 = document.getElementsByTagName('html')[0];
  obj.removeAttribute("class","noScroll");
  obj2.removeAttribute("class","noScroll");
  obj.setAttribute("class","allowScroll");
  obj2.setAttribute("class","allowScroll");
}

function disableScroll()
{
    var obj = document.getElementsByTagName('body')[0];
    var obj2 = document.getElementsByTagName('html')[0];
    obj.removeAttribute("class","allowScroll");
    obj2.removeAttribute("class","allowScroll");
    obj.setAttribute("class","noScroll");
    obj2.setAttribute("class","noScroll");    
}

export {fadeInUpAnimation,fadeOutDownAnimation,initializeAnimation};