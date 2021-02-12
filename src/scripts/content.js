/*

    File: Content.js
    Purpose: 

      [] - Content scripts are files that run in the context of web pages. 
           By using the(DOM), they are able to read details of the web pages the browser visits, 
           make changes to them and pass information to their parent extension.

      [] - Added listener to handle incoming messages from javascript events sent from a page

      [] - Content scripts live in an isolated world, 
           allowing a content script to makes changes to its JavaScript environment without 
           conflicting with the page or additional content scripts.
                   _       _                                  
                  (_)     | |                                 
   _ __ ___   __ _ _ _ __ | |_ ___ _ __   __ _ _ __   ___ ___ 
  | '_ ` _ \ / _` | | '_ \| __/ _ \ '_ \ / _` | '_ \ / __/ _ \
  | | | | | | (_| | | | | | ||  __/ | | | (_| | | | | (_|  __/
  |_| |_| |_|\__,_|_|_| |_|\__\___|_| |_|\__,_|_| |_|\___\___|


*/

const selectors = `
  .tasty-recipes,
  .ERSPrintBtn,
  [title="Print Recipe"],
  .wprm-recipe,
  .print-recipe,
  .simple-recipe-pro,
  [itemtype*="schema.org/Recipe"],
  .easyrecipe,
  .wpurp-container,
  section.zip-recipes,
  .cooked-recipe-info,
  .boorecipe-recipe,
  .ingredients-section
`

const targets = document.querySelectorAll(selectors)

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.doSkip) {
    try {
      targets[0].scrollIntoView()
      targets[0].focus()
      //chrome.extension.getBackgroundPage().console.log(targets[0])
      var new_targets = targets[0].querySelectorAll(".ingredients-item-name");
      var the_text ="";
      let recipe_text = document.getElementById('recipe');
      new_targets.forEach(function(element) {
        the_text += element.textContent;
      });
      console.log(the_text);

      chrome.runtime.sendMessage({food_list: the_text}, function(response) {
        console.log(response);
      });
      
    } catch (err) { return }
  } else if (req.skipCheck) sendResponse({ 'skip': targets && targets[0] })
  return true
})