var show_ingredients_btn = document.getElementById('showIngredients');
var show_recipes_btn = document.getElementById('showRecipes');


let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

function onExecuted(result) {
    console.log(`We made it a color`);
};

function popup() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { doSkip: true })
   });
}

 changeColor.onclick = function(element) {
  let color = element.target.value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.storage.sync.set({color: 'red'}, function() {
            changeColor.style.backgroundColor = 'red'
            changeColor.setAttribute('value', 'red');
        });
      
        chrome.tabs.executeScript( null, 
        {code:"document.body.style.backgroundColor = 'red';" },
        function(results){ chrome.extension.getBackgroundPage().console.log(results); } );
    
        popup();
    });
};

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


  // To permanently change a popup while it is closed:

  // chrome.browserAction.setPopup({popup: "new.html"});
  // If you want to temporary change a popup while it is still open:
  
  // window.location.href="new.html";
show_ingredients_btn.onclick = function(element) {
  window.location.href="../views/ingredients.html"
};

show_recipes_btn.onclick = function(element) {
  window.location.href="../views/recipe_list.html"
};

