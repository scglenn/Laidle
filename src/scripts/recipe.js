/*

    File: Recipe.js
    Purpose: 

      [] - The purpose of this page is add the recipe to local storage

*/

//Import the page animations that get used between page transitions
import {fadeInUpAnimation,fadeOutDownAnimation,initializeAnimation } from './page_transitions.js';

// Adding recipe button
var add_btn = document.getElementById('add');

// Going back a page
var back_btn = document.getElementById('back');

// The area for recipe ingredients/details to be added. 
// Expecting data to be copy/pasted into the browser.
var text_area = document.getElementById('recipeDescription');

// The name of the recipe
var recipeName = document.getElementById('recipeName');

// Keeps track of whether an alert is currently displayed
// Used to prevent the user from triggering the same alert multiple times in a row
var alert_on = false;

// Used to trigger an alert on the page
function alert(title, text, type)
{
    // If an alert isnt already displayed
    if(alert_on == false)
    {
        // Generated Alert HTML
        var alert_html = $("<div class='alert alert-dismissible " + type + "'><strong>" + title + "</strong><br> " + text + "<a href='#' class='close float-close' data-dismiss='alert' aria-label='close'>×</a></div>");

        // On alert close, reset status of alert_on
        alert_html.on('close.bs.alert', function () 
        {
            alert_on = false;
        });
        
        // Add the generated alert html to the top of recipe.html
        $('body').prepend(alert_html);
        
        // setTimeout with 0 millisecond delay adds the call back to the queue 
        // This allows for the show & fade classes to animate the alert popup properly
        setTimeout(function() 
        {
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
        alert_on = true;
    }
};

// When add button is clicked all changes are saved
// The user is redirected to the recipe list page
add_btn.onclick = function(element) 
{
    // This regex finds "+" and "-"
    // New strategies may be implemented at a later date to handle these cases
    const prohibited_regex = /\+|-/gi;
    
    // Grab the latest text area value
    var recipe_description = text_area.value;

    // Find prohibited strings in the recipe description
    var prohibited_strings = recipe_description.match(prohibited_regex);

    // Grab the latest recipe name value
    var recipe_name = recipeName.value;
    
    if (!recipe_description || !recipe_name)
    {
        // Blank recipe description and recipe name trigger an alert
        alert('Error!', "Empty Fields",'alert-danger');
    }
    else if(prohibited_strings != null)
    {
        // Prohibited strings trigger an alert
        alert('Error!', "Prohibited text: '+' '-' ", 'alert-danger');
    }
    else
    {
        // Save recipe to storage variables
        saveChanges();

        // Fade out and transition page
        fadeOutDownAnimation("../views/recipe_list.html");
    }
};

//  When the back button the user is redirected to the recipe list page
back_btn.onclick = function(element) 
{
    // Fade out and transition page
    fadeOutDownAnimation("../views/recipe_list.html");
};

// Access the url of the current page
const queryString = window.location.search;

// Grab the params placed in the url
// Note: Although this page is inside a chrome extension it still has a URL just like any other webpage
const urlParams = new URLSearchParams(queryString);

// Recipe name
var rec_name = urlParams.get('recipe_name');

// Recipe description
var rec_description = urlParams.get('recipe_description');

// Recipe ID
var rec_id = urlParams.get('recipe_id');

// Trigger callback when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () 
{
    // CSS Selector associated with recipe name and recipe description fields
    const STORAGE_SELECTOR = '.storage[id]';

    // Used to save changes and inputs made to the recipe fields
    let debounceTimer;
    
    // Adding SaveOnChange function to the change and input event listeners
    document.addEventListener('change', saveOnChange);
    document.addEventListener('input', saveOnChange);
    
    // Used to identify which field is being changed
    // Triggers the functionality to save changes
    function saveOnChange(e) 
    {
        if (e.target.closest(STORAGE_SELECTOR)) 
        {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(doSave, 100);
        }
    };

    // Saves the recipe fields to the page on load storage variable
    // Purpose: When the user clicks away from the chrome extension, the page will close
    // and this causes any changes to be lost. By saving the most recent changes to page_on_load
    // the user can open the chrome extension back where they left off.
    function doSave() 
    {
        // Access the name of the recipe
        var rec_title = recipeName.value;

        // Access the description of the recipe
        text_area = document.getElementById('recipeDescription');

        // Recipe description text
        var rec_desc = text_area.value;

        // Generate the page URL to be saved
        var page = "../views/recipe.html?recipe_name="+rec_title+"&recipe_description="+rec_desc+"&recipe_id="+rec_id+"";
    
        // Store the page url
        // Note: This page url will be saved upon the chrome extension losing focus and 
        // loaded upon the chrome extension gaining focus
        chrome.storage.sync.set({page_on_load: page}, function(){});
    };

    // Update the recipe name field at the top of the page with the recipe name passed
    // from the previous page
    // INVESTIGATION REQUIRED: This looks like a bandaid, can we fix this up?
    chrome.storage.sync.get('recipe_title', function(data) 
    {
        if(data.recipe_title != "" && rec_name == undefined)
        {
            recipeName.value = data.recipe_title;
        }
        else
        {
            recipeName.value = rec_name;
        }
    });

    // Update the recipe description text area with the recipe description from local storage
    // INVESTIGATION REQUIRED: This looks like a bandaid, can we fix this up?
    chrome.storage.sync.get('recipe_description', function(data) 
    {
        if(data.recipe_description != "" && rec_description == undefined)
        {
            text_area.innerHTML = data.recipe_description;
        }
        else
        {
            text_area.innerHTML = rec_description;
        }
    });

    // Fade in recipe page
    fadeInUpAnimation();
});

// This function saves the recipe data from this page into local storage.
function saveChanges() 
{   
    // Grab the latest text area value
    var recipe_description = text_area.value;

    // Grab the latest recipe name value
    var recipe_name = recipeName.value;

    // if the recipe id doesnt exist then 
    if(rec_id == "undefined")
    {
        // Access the number of recipes from storage
        // Note: This probably should be updated at some point. It acts more as a counter than 
        // a variable keeping track of the number of recipes
        chrome.storage.sync.get('number_of_recipes', function(data)
        {
            // Generate a new unique recipe id string by incrementing from the last stored value
            var num_of_recipes = data.number_of_recipes+1;
            var recipe_id_string = 'recipe_id_' + num_of_recipes;

            // Increase the number of recipes stored in local storage
            chrome.storage.sync.set({'number_of_recipes' : num_of_recipes}, function(){});

            // Save it using the Chrome extension storage API.
            //Variables cannot be used as keys without using computed keys, new in ES6.
            chrome.storage.sync.set({[recipe_id_string] : {recipe_name,recipe_description}}, function(){});

            //Get the recipe id list and store the new recipe id to that list
            chrome.storage.sync.get('recipe_id_list',function(list)
            {
                // Push new recipe id string onto the current recipe id list
                list.recipe_id_list.push(recipe_id_string);
                chrome.storage.sync.set({'recipe_id_list' : list.recipe_id_list}, function(){});
            });
        });
    }
    else
    {
        //Update existing recipe id with recipe name and/or recipe description changes
        chrome.storage.sync.set({[rec_id] : {recipe_name,recipe_description}}, function() {});
    }
}