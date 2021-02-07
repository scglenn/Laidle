var add_btn = document.getElementById('add');
var back_btn = document.getElementById('back');
var text_area = document.getElementById('recipeDescription');
var recipeName = document.getElementById('recipeName');


add_btn.onclick = function(element) 
{
    saveChanges();
    window.location.href="../views/recipe_list.html"
};

back_btn.onclick = function(element) 
{
    window.location.href="../views/recipe_list.html"
};

const queryString = window.location.search;//window.location.href;
const urlParams = new URLSearchParams(queryString);
var rec_name = urlParams.get('recipe_name');
console.log(rec_name);
var rec_description = urlParams.get('recipe_description');
console.log(rec_description);
var rec_id = urlParams.get('recipe_id');
console.log(rec_id);

//probably going to need to pull the recipe id also so we know which one to update
//unless it doesnt have an id in which case its a new recipe

recipeName.value = rec_name;
text_area.innerHTML = rec_description;

function saveChanges() {
    
    var recipe_description = text_area.value;
    var recipe_name = recipeName.value;
    if (!recipe_description) {
      message('Error: No value specified');
      return;
    }

    if (!recipe_name) {
        message('Error: No value specified');
        return;
    }

    console.log("whats going on with rec id"+rec_id);
    if(rec_id == "undefined")
    {
        chrome.storage.sync.get('number_of_recipes', function(data) {
            var num_of_recipes = data.number_of_recipes+1;
            var recipe_id_string = 'recipe_id_' + num_of_recipes;
    
            chrome.storage.sync.set({'number_of_recipes' : num_of_recipes}, function() {
                // Notify that we saved.
                //message('Settings saved');
            });
    
            console.log("Adding new recipe:");
            console.log("num_of_recipes:"+ num_of_recipes);
            console.log("recipe_name:"+recipe_name);
            console.log("recipe_description:" + recipe_description);
            // Save it using the Chrome extension storage API.
            //Variables cannot be used as keys without using computed keys, new in ES6.
            chrome.storage.sync.set({[recipe_id_string] : {recipe_name,recipe_description}}, function() {
                // Notify that we saved.
                //message('Settings saved');
            });
        });
    }
    else
    {
        chrome.storage.sync.set({[rec_id] : {recipe_name,recipe_description}}, function() {
            // Notify that we saved.
            //message('Settings saved');
        });
    }
    
  }



// let changeColor = document.getElementById('changeColor');

// chrome.storage.sync.get('color', function(data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);
// });

// function onExecuted(result) {
//     console.log(`We made it a color`);
// };

// function popup() {
//     chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
//     var activeTab = tabs[0];
//     chrome.tabs.sendMessage(activeTab.id, { doSkip: true })
//    });
// }

//  changeColor.onclick = function(element) {
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


//   // To permanently change a popup while it is closed:

//   // chrome.browserAction.setPopup({popup: "new.html"});
//   // If you want to temporary change a popup while it is still open:
  
//   // window.location.href="new.html";
// show_ingredients_btn.onclick = function(element) {
//   window.location.href="ingredients.html"
// };

// show_recipes_btn.onclick = function(element) {
//   window.location.href="recipes.html"
// };