/*

    File: background.js
    Purpose: 

      [] - Background scripts are registered in the manifest under the "background" field. 
           They are listed in an array after the "scripts" key, and "persistent" should be specified as false.

      [] - Set up listeners

*/

// Initialize the extension on install
chrome.runtime.onInstalled.addListener(function() {

  //Store the color variable in local storage
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log("The color is green.");
  });

  //Store the number_of_recipes variable in local storage
  chrome.storage.sync.set({number_of_recipes: 1}, function(){
    console.log("number of recipes = 1");
  });

  //Store the first recipe in local storage in order to seed the user data
  chrome.storage.sync.set({'recipe_id_1': {recipe_name: "Pizza",recipe_description: "1 cup of cheese"}}, function(){
    console.log("created recipe 1");
  });

  //Store the page that is going to be loaded after losing focus
  chrome.storage.sync.set({page_on_load: 'popup.html'}, function(){
    console.log("page on load is popup.html");
  });

  
  chrome.storage.sync.set({recipe_title: undefined}, function(){
        
  });

  chrome.storage.sync.set({recipe_description: undefined}, function(){
      
  });

  //TODO: What does this function call do? What is its purpose?
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// Check tab if skippable
const doCheck = tabid => {
  setTimeout(() => {  chrome.tabs.sendMessage(tabid, { skipCheck: true }, res => {
    if (res && res.skip) setBadge(true)
    else setBadge(false)
    return true
  }); }, 500)
  
}

// Set badge
const setBadge = bool => {
  const text = { text: bool ? 'Skip!' : '' }
  chrome.browserAction.setBadgeText(text)
}

// Set badge background color
chrome.browserAction.setBadgeBackgroundColor({ color: '#808000' })

// On page navigation
chrome.tabs.onUpdated.addListener((tabid, changeInfo, tab) => {
  if (changeInfo.status == 'complete' && tab.active) doCheck(tabid)
})

// On tab switch
chrome.tabs.onActivated.addListener(activeInfo => {
  doCheck(activeInfo.tabId)
})

function mySaveFunction(data){
  console.log("my save function");
};

console.log("background script");
