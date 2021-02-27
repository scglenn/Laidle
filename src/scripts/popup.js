/*

    File: Popup.js
    Purpose: 

      [] - This is the designated javascript for the popup view.

      [] - This gives the user the ability to select the grocery list or view/add/edit/delete recipes

*/

// Grab the html page that was loaded last
// This functionality helps retain the users last actions
chrome.storage.sync.get('page_on_load', function(data) {
  
  var page = data.page_on_load;

  // ingredients.html
  // What needs to be saved?
  // - html page file to load on click
  // - Ingredient strings
  if(page == "ingredients.html")
  {
    window.location.href="../views/ingredients.html";
  }

  // recipe_list.html
  // What needs to be saved?
  // - html page file to load on click
  // - probably nothing special, just reload everything
  if(page == "recipe_list.html")
  {
    window.location.href="../views/recipe_list.html";
  }

  // recipe.html
  // What needs to be saved?
  // - html page file to load on click
  // - recipe title
  // - recipe description
  if(page.includes("recipe.html"))
  {
    window.location.href=page;
  }

});

// Both buttons that give the user the ability to generate grocery list and the recipes page
var show_ingredients_btn = document.getElementById('showIngredients');
var show_recipes_btn = document.getElementById('showRecipes');

// This function sends the doSkip message to the content.js page
function popup() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { doSkip: true })
   });
}

// Listener for receiving a message from the extension or content scripts
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

// Transition extension page to ingredients view
show_ingredients_btn.onclick = function(element) {
  window.location.href="../views/ingredients.html";

  // Find the current html page in order to know which data needs to be saved.
  var page = "ingredients.html";
  
  //Store the page that is going to be loaded after losing focus
  chrome.storage.sync.set({page_on_load: page}, function(){
      console.log("page on load is " + page);
  });
  
};

// Transition extension page to the recipe list view
show_recipes_btn.onclick = function(element) {

  window.location.href="../views/recipe_list.html";

  // Find the current html page in order to know which data needs to be saved.
  var page = "recipe_list.html";
  
  //Store the page that is going to be loaded after losing focus
  chrome.storage.sync.set({page_on_load: page}, function(){
      console.log("page on load is " + page);
  });
  
};