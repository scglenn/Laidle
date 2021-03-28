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
  chrome.storage.sync.set({'recipe_id_1': {recipe_name: "Tacos",recipe_description: 
`2 tablespoons reduced sodium soy sauce
2 tablespoons freshly squeezed lime juice
2 tablespoons canola oil, divided
3 cloves garlic, minced
2 teaspoons chili powder
1 teaspoon ground cumin
1 teaspoon dried oregano
1 1/2 pounds skirt steak, cut into 1/2-inch pieces
12 mini flour tortillas, warmed
3/4 cup diced red onion
1/2 cup chopped fresh cilantro leaves
1 lime, cut into wedges`
}}, function(){console.log("created recipe 1");});

  var list = ['recipe_id_1'];

  //Store the list of recipe ids
  chrome.storage.sync.set({'recipe_id_list': list}, function(){console.log("created recipe 1");});

  //Store the page that is going to be loaded after losing focus
  chrome.storage.sync.set({page_on_load: 'popup.html'}, function(){console.log("page on load is popup.html");});
  
  chrome.storage.sync.set({recipe_title: undefined}, function(){});

  chrome.storage.sync.set({recipe_description: undefined}, function(){});
});
