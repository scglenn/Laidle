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

// Keeps track of whether an alert is currently displayed
// Used to prevent the user from triggering the same alert multiple times in a row
var alert_status = false;

// Used to trigger an alert on the page
function alert(title, text, type)
{
    // If an alert isnt already displayed
    if(alert_status == false)
    {
        // Generated Alert HTML
        var alert_html = $("<div class='alert alert-dismissible " + type + "'><strong>" + title + "</strong><br> " + text + "<a href='#' class='close float-close' data-dismiss='alert' aria-label='close'>×</a></div>");

        // On alert close, reset status of alert_on
        alert_html.on('close.bs.alert', function () 
        {
          alert_status = false;
        });
        // setTimeout with 0 millisecond delay adds the call back to the queue 
        // This allows for the show & fade classes to animate the alert popup properly
        setTimeout(function() 
        {
            // Add the generated alert html to the top of recipe.html
            $('body').prepend(alert_html);

            // Alert popup appears and fades in
            alert_html.addClass('show fade');

            // Page shakes to indicate a rejected action
            $('body').addClass('shake');

            // After 1 second, stop the page from shaking back and forth
            setTimeout(function()
            {
                $('body').removeClass('shake');
            }, 1000);
        },0);

        // Set to true, to indicate the the alert is displayed
        alert_status = true;
    }
};

// Exporting these functions to be used in other .js files
export {alert,fadeInUpAnimation,fadeOutDownAnimation,initializeAnimation};