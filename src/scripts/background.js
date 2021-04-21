/*

    File: background.js
    Purpose: 

      [] - Background scripts are registered in the manifest under the "background" field. 
           They are listed in an array after the "scripts" key, and "persistent" should be specified as false.

      [] - Set up listeners

*/

// Initialize the extension on install
chrome.runtime.onInstalled.addListener(function() 
{
  //Store the number_of_recipes variable in local storage
  chrome.storage.sync.set({number_of_recipes: 1}, function(){console.log("number of recipes = 1");});

  //Store the first recipe in local storage in order to seed the user data
  chrome.storage.sync.set(
  { 
    'recipe_id_1': 
    {
      recipe_name: "Tacos",
      recipe_description: 
        "2 tablespoons reduced sodium soy sauce\n"+
        "2 tablespoons freshly squeezed lime juice\n"+
        "2 tablespoons canola oil, divided\n"+
        "3 cloves garlic, minced\n"+
        "2 teaspoons chili powder\n"+
        "1 teaspoon ground cumin\n"+
        "1 teaspoon dried oregano\n"+
        "1 1/2 pounds skirt steak, cut into 1/2-inch pieces\n"+
        "12 mini flour tortillas, warmed\n"+
        "3/4 cup diced red onion\n"+
        "1/2 cup chopped fresh cilantro leaves\n"+
        "1 lime, cut into wedges",
      recipe_is_included: true
    }
  }, function(){console.log("created recipe 1");});

  // Seed the recipe id list with an initial recipe
  var list = ['recipe_id_1'];

  //Store the list of recipe ids
  chrome.storage.sync.set({'recipe_id_list': list}, function(){console.log("created recipe 1");});

  //Store the page that is going to be loaded after losing focus
  chrome.storage.sync.set({page_on_load: 'popup.html'}, function(){console.log("page on load is popup.html");});
  
  //Initialize recipe title storage variable
  chrome.storage.sync.set({recipe_title: undefined}, function(){});

  //Initialize recipe description storage variable
  chrome.storage.sync.set({recipe_description: undefined}, function(){});

  //Initialize retain grocery list so that the grocery list will always be generated with WIT requested on startup
  chrome.storage.sync.set({retain_grocery_list: false}, function(){});
});
