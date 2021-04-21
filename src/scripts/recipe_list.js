/*

    File: Recipe_list.js
    Purpose: 

      [] - The purpose of this page is view the recipes in local storage

      [] - Recipes can be added/edited/removed

*/

// Import the page animations that get used between page transitions
import {alert,fadeOutDownAnimation,initializeAnimation } from './page_transitions.js';

// Grab the number of recipes in local storage
chrome.storage.sync.get('number_of_recipes', function(data)
{
  // The number of recipes in local storage
  var number_of_recipes = data.number_of_recipes;
    
  chrome.storage.sync.get('recipe_id_list',function(list)
  {
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

    // Get each recipe listed in the recipe list array from local storage
    // Note: Variables cannot be used as keys without using computed keys, new in ES6.
    chrome.storage.sync.get(list.recipe_id_list , function(data) 
    {
        // Iterate through each recipe
        Object.keys(data).forEach(key =>
        {
            // Used as a temporary variable to index the dictionary
            var temp_recipe_id_string = key;

            let checked = "";
            let recipe_is_included = data[temp_recipe_id_string].recipe_is_included;
            if(recipe_is_included)
            {
                checked = "checked";
            }
            
            let recipe_name = data[temp_recipe_id_string].recipe_name;
            let recipe_description = data[temp_recipe_id_string].recipe_description
            let checkbox_fragment = "<div class='form-check'><input class='form-check-input' type='checkbox' value='' id='checkbox_" + temp_recipe_id_string +"' "+checked+"><label class='form-check-label' for='flexCheckChecked'></label></div>";
            let edit_btn_fragment = "<button class='editButton btn btn-primary btn-lg' id='edit"+'_'+temp_recipe_id_string+"' type='button'>Edit</button>";
            let remove_btn_fragment = "<button class='removeButton btn btn-secondary btn-lg' id='remove"+'_'+temp_recipe_id_string+"' type='button'>Remove</button>";
            let recipe_row_fragement = "<p>" + data[temp_recipe_id_string].recipe_name + "</p><div class='d-flex flex-row'><div class='p-2 p-2-check'>" + checkbox_fragment + "</div><div class='p-2 p-2-button'>" + edit_btn_fragment + "</div><div class='p-2 p-2-button'>" + remove_btn_fragment + "</div></div>";
            var fragment = create("<div class='recipeRow'>"+recipe_row_fragement+ "</div>"); 
            
            // Insert the p tag into the document body
            document.getElementById('recipeList').insertBefore(fragment, document.getElementById('recipeList').childNodes[0]);

            // Access the edit button
            var edit_btn = document.getElementById('edit'+'_'+temp_recipe_id_string);

            // Access the remove button
            var remove_btn = document.getElementById('remove'+'_'+temp_recipe_id_string);

            // Access the check box
            var checkbox_btn = document.getElementById('checkbox'+'_'+temp_recipe_id_string); 

            // 
            checkbox_btn.onclick = function(element)
            {
                // Not sure this logic makes sense
                //
                recipe_is_included = !recipe_is_included;

                // 
                chrome.storage.sync.set({[temp_recipe_id_string] : {recipe_name,recipe_description,recipe_is_included}}, function(){});
                
                // Set retain grocery list to false so that the grocery list will be regenerated with WIT requests rather than pulled from memory
                chrome.storage.sync.set({retain_grocery_list: false}, function(){});
            };

            // This should fill the recipe page and send the user to recipe.html
            edit_btn.onclick = function(element) 
            {
                // This ensures that return characters are retained in the string when passed via URL
                var temp = encodeURIComponent(data[temp_recipe_id_string].recipe_description);

                // Params are used in url as a way to transfer data between pages
                // Find the current html page in order to know which data needs to be saved.
                var page = "../views/recipe.html?recipe_name="+data[temp_recipe_id_string].recipe_name+"&recipe_description="+temp +"&recipe_id="+temp_recipe_id_string+"";
                
                //Store the page that is going to be loaded after losing focus
                chrome.storage.sync.set({page_on_load: page}, function()
                {
                    console.log("page on load is " + page);
                });

                // Transition to the recipe page to edit recipe details
                fadeOutDownAnimation(page);
            };

            //  This should remove the recipe data and reload recipe_list.html
            remove_btn.onclick = function(element) 
            {
                // Remove recipe and recipe data from local storage
                chrome.storage.sync.remove([key], function(result)
                {
                    //Get the recipe id list and store the new recipe id to that list
                    chrome.storage.sync.get('recipe_id_list',function(list)
                    {
                      // Regenerate recipe id list without the recipe id that is going to be removed
                      list.recipe_id_list = list.recipe_id_list.filter(e => e !== key);
                      chrome.storage.sync.set({'recipe_id_list' : list.recipe_id_list}, function(){});
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
    // Get the recipe id list to check the number of recipes in storage
  chrome.storage.sync.get('recipe_id_list',function(list)
  {
    //Check if local storage is filled to recipe limit
    //Problems: 
    // 1). 11 of them were created, so i need to figure out whats going on there
    // 2). I need the alert to appear on the UI wherever the use is instead of the top of the body
    if(list.recipe_id_list.length <= 10)
    {
        fadeOutDownAnimation("../views/recipe.html?recipe_name="+""+"&recipe_description="+""+"&recipe_id="+undefined+"");
    }
    else
    {
      //Alert if no recipes exist
      alert('Error!', "Recipe Limit Reached. Donate To Support Additional Updates!",'alert-danger');
    }
  });
    
};

// This should send the user to the default popup page
back_btn.onclick = function(element) 
{
    // Fade out and transition to the next page
    fadeOutDownAnimation("../views/popup.html");
};

// Configure page to load and play animation
initializeAnimation();