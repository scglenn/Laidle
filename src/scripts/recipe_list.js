/*

    File: Recipe_list.js
    Purpose: 

      [] - The purpose of this page is view the recipes in local storage

      [] - Recipes can be added/edited/removed

*/


// Grab the number of recipes in local storage
chrome.storage.sync.get('number_of_recipes', function(data) {
    
    // The number of recipes in local storage
    var number_of_recipes = data.number_of_recipes;
    
    /*
         _                 
        | |                
        | |__  _   _  __ _ 
        | '_ \| | | |/ _` |
        | |_) | |_| | (_| |
        |_.__/ \__,_|\__, |
                      __/ |
                     |___/ 
    */
    //There is a bug here where if we delete recipe 0 then everything breaks
    //Proposed solution: need to store a list of recipe ids instead of using number of recipes
    var recipe_list = [];

    // Add each recipe id to the recipe list array
    for(var i = 0;i< number_of_recipes; i++)
    {
        
        var recipe_id_string = 'recipe_id_' + (i+1);
        recipe_list.push(recipe_id_string);
    }

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
    chrome.storage.sync.get(recipe_list , function(data) 
    {

        // Iterate through each recipe
        Object.keys(data).forEach(key => {

            // Used as a temporary variable to index the dictionary
            var temp_recipe_id_string = key;

            // This log will display each key value pair in the recipe_list variable
            console.log(key, data[key]);

            // Create p tag that has the recipes name + edit/remove buttons
            var fragment = create("<p>" + data[temp_recipe_id_string].recipe_name + "</p><button id='edit"+'_'+temp_recipe_id_string+"' type='button' class='btn btn-outline-primary'>Edit</button><button id='remove"+'_'+temp_recipe_id_string+"' type='button' class='btn btn-outline-secondary'>Remove</button>"); 
    
            // Insert the p tag into the document body
            document.getElementById('recipeList').insertBefore(fragment, document.getElementById('recipeList').childNodes[0]);

            // Access the edit button
            var edit_btn = document.getElementById('edit'+'_'+temp_recipe_id_string);

            // Access the remove button
            var remove_btn = document.getElementById('remove'+'_'+temp_recipe_id_string);

            //  This should fill the recipe page and send the user to recipe.html
            edit_btn.onclick = function(element) 
            {
                // Params are used in url as a way to transfer data between pages
                window.location.href="../views/recipe.html?recipe_name="+data[temp_recipe_id_string].recipe_name+"&recipe_description="+data[temp_recipe_id_string].recipe_description+"&recipe_id="+temp_recipe_id_string+"";
            };

            //  This should remove the recipe data and reload recipe_list.html
            remove_btn.onclick = function(element) 
            {
                // Remove recipe and recipe data from local storage
                chrome.storage.sync.remove([key], function(result) {
                    
                    // Get the number of recipes in local storage
                    // NOTE: This should probably be chaned because this is the second time its called
                    chrome.storage.sync.get('number_of_recipes', function(data) {

                        // Reduce number of recipes by 1
                        var num_of_recipes = data.number_of_recipes-1;
                
                        // Set the new number of recipes in local storage
                        chrome.storage.sync.set({'number_of_recipes' : num_of_recipes}, 
                        function() {
                            

                        });
                    });

                    // Transition user to recipe list page
                    window.location.href="../views/recipe_list.html";
                });
            };
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
    window.location.href="../views/recipe.html?recipe_name="+"test"+"&recipe_description="+"test"+"&recipe_id="+undefined+"";
};

// This should send the user to the default popup page
back_btn.onclick = function(element) 
{
    window.location.href="../views/popup.html"
};

// Listener for message from extension or content script
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