/*

    File: Recipe.js
    Purpose: 

      [] - The purpose of this page is add the recipe to local storage

*/

// Adding recipe button
var add_btn = document.getElementById('add');

// Going back a page
var back_btn = document.getElementById('back');

// The area for recipe ingredients/details to be added. 
// Expecting data to be copy/pasted into the browser.
var text_area = document.getElementById('recipeDescription');

// The name of the recipe
var recipeName = document.getElementById('recipeName');

// When add button is clicked all changes are saved
// The user is redirected to the recipe list page
add_btn.onclick = function(element) 
{
    saveChanges();
    window.location.href="../views/recipe_list.html"
};

//  When the back button the user is redirected to the recipe list page
back_btn.onclick = function(element) 
{
    window.location.href="../views/recipe_list.html"
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

// Update the recipe name field at the top of the page with the recipe name passed
// from the previous page
recipeName.value = rec_name;

// Update the recipe description text area with the recipe description from local storage
text_area.innerHTML = rec_description;

// This fucntion saves the recipe data from this page into local storage.
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

    // TODO: Leaving this here for now
    console.log("whats going on with rec id" + rec_id);

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
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
    //   if (request.greeting == "hello")
    //     sendResponse({farewell: "goodbye"});
    var test= document.getElementById('recipe');
    test.textContent = request.food_list;
    }
  );