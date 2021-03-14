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

// $('.alert').alert();

// When add button is clicked all changes are saved
// The user is redirected to the recipe list page
add_btn.onclick = function(element) 
{
    saveChanges();
    
    //document.getElementsByClassName('alert')[0].alert();
    // $('.alert').show('fade');
    fadeOutDownAnimation("../views/recipe_list.html");
};

//  When the back button the user is redirected to the recipe list page
back_btn.onclick = function(element) 
{
    fadeOutDownAnimation("../views/recipe_list.html");
};


//  _                     _       _     _ 
// | |                   | |     (_)   | |
// | |__   __ _ _ __   __| | __ _ _  __| |
// | '_ \ / _` | '_ \ / _` |/ _` | |/ _` |
// | |_) | (_| | | | | (_| | (_| | | (_| |
// |_.__/ \__,_|_| |_|\__,_|\__,_|_|\__,_|
// 
// Note:
// This functionality was added here in the case of the user wanting to update an existing recipe
// If the url has search params passed to it from the previous page then that data will be used.
// 
// Questions:
// Probably going to need to pull the recipe id also so we know which one to update
// Unless it doesnt have an id in which case its a new recipe
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Recipe name
var rec_name = urlParams.get('recipe_name');

// Recipe description
var rec_description = urlParams.get('recipe_description');

// Recipe ID
var rec_id = urlParams.get('recipe_id');


document.addEventListener('DOMContentLoaded', function () {

    //https://stackoverflow.com/questions/60361379/how-to-get-chrome-storage-to-save-on-chrome-extension-popup-close
    const STORAGE_SELECTOR = '.storage[id]';
    let debounceTimer;
    
    document.addEventListener('change', saveOnChange);
    document.addEventListener('input', saveOnChange);
    
    
    function saveOnChange(e) {
      if (e.target.closest(STORAGE_SELECTOR)) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(doSave, 100);
      }
    };

    function doSave() {
        var rec_title = recipeName.value;

        // - recipe description
        text_area = document.getElementById('recipeDescription');
        var rec_desc = text_area.value;

        var page = "../views/recipe.html?recipe_name="+rec_title+"&recipe_description="+rec_desc+"&recipe_id="+rec_id+"";//"recipe.html";//path.split("/").pop();
    
        //DEBUG: new method i am trying
        chrome.storage.sync.set({page_on_load: page}, function(){
            //console.log("page on load is " + page);
        });
    };

    // Update the recipe name field at the top of the page with the recipe name passed
    // from the previous page
    chrome.storage.sync.get('recipe_title', function(data) {
        
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
    chrome.storage.sync.get('recipe_description', function(data) {

        if(data.recipe_description != "" && rec_description == undefined)
        {
            text_area.innerHTML = data.recipe_description;
        }
        else
        {
            text_area.innerHTML = rec_description;
        }

    });

    fadeInUpAnimation();
});

// This function saves the recipe data from this page into local storage.
function saveChanges() 
{   
    // Grab the latest text area value
    var recipe_description = text_area.value;

    // Grab the latest recipe name value
    var recipe_name = recipeName.value;

    // Recipe description is required
    if (!recipe_description) {
        message('Error: No value specified');
        return;
    }

    // Recipe name is required
    if (!recipe_name) {
        message('Error: No value specified');
        return;
    }

    // Replace "And"s with \n 
    // Somewhat of a bandaid
    // Need to re-learn regex again
    if(recipe_description.includes(",") == false)
    {
        const regex = /And/gi;
        recipe_description = recipe_description.replace(regex,"\n");
    }
    
    const hyphen_regex = /-/gi;
    recipe_description = recipe_description.replace(hyphen_regex,' ');

    // if the recipe id doesnt exist then 
    if(rec_id == "undefined")
    {
        chrome.storage.sync.get('number_of_recipes', function(data) {
            var num_of_recipes = data.number_of_recipes+1;
            var recipe_id_string = 'recipe_id_' + num_of_recipes;

            // Increase the number of recipes stored in local storage
            chrome.storage.sync.set({'number_of_recipes' : num_of_recipes}, function() {
                // Notify that we saved.
                //message('Settings saved');
            });

            // Save it using the Chrome extension storage API.
            //Variables cannot be used as keys without using computed keys, new in ES6.
            chrome.storage.sync.set({[recipe_id_string] : {recipe_name,recipe_description}}, function() {
                // Notify that we saved.
                //message('Settings saved');
            });

            //Get the recipe id list and store the new recipe id to that list
            chrome.storage.sync.get('recipe_id_list',function(list){
                list.recipe_id_list.push(recipe_id_string);
                chrome.storage.sync.set({'recipe_id_list' : list.recipe_id_list}, function() {
                    
                });
            });
        });
    }
    else
    {
        //Update existing recipe id with recipe name and/or recipe description changes
        chrome.storage.sync.set({[rec_id] : {recipe_name,recipe_description}}, function() {
            // Notify that we saved.
            //message('Settings saved');
        });
    }
}

// Listener for receiving messages from the extension or content script
// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       console.log(sender.tab ?
//                   "from a content script:" + sender.tab.url :
//                   "from the extension");
//     //   if (request.greeting == "hello")
//     //     sendResponse({farewell: "goodbye"});
//     var test= document.getElementById('recipe');
//     test.textContent = request.food_list;
//     }
// );