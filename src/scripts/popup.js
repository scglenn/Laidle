/*

    File: Popup.js
    Purpose: 

      [] - This is the designated javascript for the popup view.

      [] - This gives the user the ability to select the grocery list or view/add/edit/delete recipes

*/

// Both buttons that give the user the ability to generate grocery list and the recipes page
var show_ingredients_btn = document.getElementById('showIngredients');
var show_recipes_btn = document.getElementById('showRecipes');

// for testing purposes only
// let changeColor = document.getElementById('changeColor');

// for testing purposes only
// chrome.storage.sync.get('color', function(data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);
// });

// for testing purposes only
// function onExecuted(result) {
//     console.log(`We made it a color`);
// };

// This function sends the doSkip message to the content.js page
function popup() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { doSkip: true })
   });
}

// for testing purposes only
// changeColor.onclick = function(element) {
//   let color = element.target.value;
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//         chrome.storage.sync.set({color: 'red'}, function() {
//             changeColor.style.backgroundColor = 'red'
//             changeColor.setAttribute('value', 'red');
//         });
      
//         chrome.tabs.executeScript( null, 
//         {code:"document.body.style.backgroundColor = 'red';" },
//         function(results){ chrome.extension.getBackgroundPage().console.log(results); } );
    
//         popup();
//     });
// };

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
  window.location.href="../views/ingredients.html"
};

// Transition extension page to the recipe list view
show_recipes_btn.onclick = function(element) {
  window.location.href="../views/recipe_list.html"
};

