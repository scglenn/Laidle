/*

    File: page_transitions.js
    Purpose: 

      [] - Contains functionality for animating page transitions

      [] - Contains functionality for enabling/disabling scrolling

      [] - Contains functionality for transitioning to another page
*/

// Applies fadeInUpAnimation when the DOM content is loaded
function initializeAnimation()
{
    document.addEventListener("DOMContentLoaded", () => setTimeout(fadeInUpAnimation, 100));
}

// Applies slideUp to the mainMenu and enables scrolling after 1 second
function fadeInUpAnimation()
{
  // Access the main menu window
  let main_menu = document.getElementById('mainMenu');

  // Animate main menu to slide/fade up
  main_menu.setAttribute("class", "slideUp");

  // After 1 second, enable scrolling
  // Note: This is applied after the animation is completed otherwise
  // the scroll bar would show up as the page is sliding up.
  setTimeout(enableScroll,1000);
}

// Removes slideUp and applies fadeOut
// Page is transitioned to the transition_page_name
function fadeOutDownAnimation(transition_page_name)
{
  // Scrolling is disables so the scroll bar doesnt appear
  // Mostly a design preference, i just thought it looked bad
  disableScroll();

  // Access the main menu window
  let main_menu = document.getElementById('mainMenu');
  
  // Remove slideUp so that the element is
  // configured when fadeOut is applied
  main_menu.removeAttribute("class", "slideUp");

  // Apply fadeOut
  main_menu.setAttribute("class","fadeOut");

  // After 250 milliseconds, transition to the transition_page_name
  setTimeout(function() {transitionPageTo(transition_page_name)},250);
}    

// Transitions the current page to the transition_page_name URL
function transitionPageTo(transition_page_name)
{
  // Set the URL to the provide page name
  window.location.href = transition_page_name;
  
  //Store the page that is going to be loaded after losing focus
  chrome.storage.sync.set({page_on_load: transition_page_name}, function(){});
}

// Enables scrolling 
function enableScroll()
{
  let body = document.getElementsByTagName('body')[0];
  let html = document.getElementsByTagName('html')[0];
  body.removeAttribute("class","noScroll");
  html.removeAttribute("class","noScroll");
  body.setAttribute("class","allowScroll");
  html.setAttribute("class","allowScroll");
}

// Disables scrolling
function disableScroll()
{
  let body = document.getElementsByTagName('body')[0];
  let html = document.getElementsByTagName('html')[0];
  body.removeAttribute("class","allowScroll");
  html.removeAttribute("class","allowScroll");
  body.setAttribute("class","noScroll");
  html.setAttribute("class","noScroll");    
}

// Exporting these functions to be used in other .js files
export {fadeInUpAnimation,fadeOutDownAnimation,initializeAnimation};