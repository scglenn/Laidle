/*

    File: Recipe_list.js
    Purpose: 

      [] - The purpose of this page is view the recipes in local storage

      [] - Recipes can be added/edited/removed

*/

import {fadeOutDownAnimation,initializeAnimation } from './page_transitions.js';


// Grab the number of recipes in local storage
chrome.storage.sync.get('number_of_recipes', function(data) {
    
  // The number of recipes in local storage
  var number_of_recipes = data.number_of_recipes;
    
  chrome.storage.sync.get('recipe_id_list',function(list){
    
    //Create html
    function create(htmlStr) 
    {
        // The frag variable is a document fragment
        // The temp variable is a div element
        var frag = document.createDocumentFragment(),temp = document.createElement('div');

        // Insert the html into the div element
        temp.innerHTML = htmlStr;

        //This inserts the div element into the document fragment
        while (temp.firstChild) 
        {
            frag.appendChild(temp.firstChild);
        }

        // This returns formatted html
        return frag;
    }

    console.log(list.recipe_id_list);
    // Get each recipe listed in the recipe list array from local storage
    // Note: Variables cannot be used as keys without using computed keys, new in ES6.
    chrome.storage.sync.get(list.recipe_id_list , function(data) 
    {

        // Iterate through each recipe
        Object.keys(data).forEach(key => {

            // Used as a temporary variable to index the dictionary
            var temp_recipe_id_string = key;

            // Create p tag that has the recipes name + edit/remove buttons
            var fragment = create("<p class='recipeRow'>" + data[temp_recipe_id_string].recipe_name + "<br><button class='editButton btn btn-primary btn-lg' id='edit"+'_'+temp_recipe_id_string+"' type='button'>Edit</button><button class='removeButton btn btn-secondary btn-lg' id='remove"+'_'+temp_recipe_id_string+"' type='button'>Remove</button></p>"); 
    
            // Insert the p tag into the document body
            document.getElementById('recipeList').insertBefore(fragment, document.getElementById('recipeList').childNodes[0]);

            // Access the edit button
            var edit_btn = document.getElementById('edit'+'_'+temp_recipe_id_string);

            // Access the remove button
            var remove_btn = document.getElementById('remove'+'_'+temp_recipe_id_string);

            //  This should fill the recipe page and send the user to recipe.html
            edit_btn.onclick = function(element) 
            {
                // This ensures that return characters are retained in the string when passed via URL
                var temp = encodeURIComponent(data[temp_recipe_id_string].recipe_description);

                // Params are used in url as a way to transfer data between pages
                window.location.href="../views/recipe.html?recipe_name="+data[temp_recipe_id_string].recipe_name+"&recipe_description="+temp /*data[temp_recipe_id_string].recipe_description*/+"&recipe_id="+temp_recipe_id_string+"";
            
                // Find the current html page in order to know which data needs to be saved.
                var page = "../views/recipe.html?recipe_name="+data[temp_recipe_id_string].recipe_name+"&recipe_description="+temp /*data[temp_recipe_id_string].recipe_description*/+"&recipe_id="+temp_recipe_id_string+"";//window.location.href;//"recipe.html";//path.split("/").pop();
                
                //Store the page that is going to be loaded after losing focus
                chrome.storage.sync.set({page_on_load: page}, function(){
                    console.log("page on load is " + page);
                });
            };

            //  This should remove the recipe data and reload recipe_list.html
            remove_btn.onclick = function(element) 
            {
                // Remove recipe and recipe data from local storage
                chrome.storage.sync.remove([key], function(result) {

                    //Get the recipe id list and store the new recipe id to that list
                    chrome.storage.sync.get('recipe_id_list',function(list){
                      
                      list.recipe_id_list = list.recipe_id_list.filter(e => e !== key);
                      chrome.storage.sync.set({'recipe_id_list' : list.recipe_id_list}, function() {
                          
                      });
                    });

                    // Transition user to recipe list page
                    window.location.href="../views/recipe_list.html";
                });
            };
        });
    });
  });
});

// Access the add button
var add_btn = document.getElementById('add');

// Access the back button
var back_btn = document.getElementById('back');

//  This should send the user to a blank recipe.html
add_btn.onclick = function(element) 
{
    fadeOutDownAnimation("../views/recipe.html?recipe_name="+""+"&recipe_description="+""+"&recipe_id="+undefined+"");
};

// This should send the user to the default popup page
back_btn.onclick = function(element) 
{
    fadeOutDownAnimation("../views/popup.html");
};


initializeAnimation();