//Testing the ability to store and set variables
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log("The color is green.");
  });

  chrome.storage.sync.set({number_of_recipes: 1}, function(){
    console.log("number of recipes = 1");
  });

  chrome.storage.sync.set({'recipe_id_1': {recipe_name: "Pizza",recipe_description: "1 cup of cheese"}}, function(){
    console.log("created recipe 1");
  });

  // chrome.storage.sync.set({})

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
chrome.browserAction.setBadgeBackgroundColor({ color: '#808000' })

// On page navigation
chrome.tabs.onUpdated.addListener((tabid, changeInfo, tab) => {
  if (changeInfo.status == 'complete' && tab.active) doCheck(tabid)
})

// On tab switch
chrome.tabs.onActivated.addListener(activeInfo => {
  doCheck(activeInfo.tabId)
})
