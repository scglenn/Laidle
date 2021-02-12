/*

    File: Recipe_list.js
    Purpose: 

      [] - The purpose of this page is view the recipes in local storage

      [] - Recipes can be added/edited/removed

*/

chrome.storage.sync.get('number_of_recipes', function(data) {
    var number_of_recipes = data.number_of_recipes;
    console.log("number_of_recipes:"+number_of_recipes);
    
    //There is a bug here where if we delete recipe 0 then everything breaks
    //Proposed solution: need to store a list of recipe ids instead of using number of recipes
    var recipe_list = [];
    for(var i = 0;i< number_of_recipes; i++)
    {
        console.log("iteration:"+i);
        var recipe_id_string = 'recipe_id_' + (i+1);
        recipe_list.push(recipe_id_string);
    }

    //Create html
    function create(htmlStr) {
        var frag = document.createDocumentFragment(),
            temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
            }
            return frag;
        }

            //Variables cannot be used as keys without using computed keys, new in ES6.
            chrome.storage.sync.get(recipe_list , function(data) 
            {
                Object.keys(data).forEach(key => {

                    var temp_recipe_id_string = key;//recipe_id_string;

                    console.log(key, data[key]);

                    var fragment = create("<p>" + data[temp_recipe_id_string].recipe_name + "</p><button id='edit"+'_'+temp_recipe_id_string+"' type='button' class='btn btn-outline-primary'>Edit</button><button id='remove"+'_'+temp_recipe_id_string+"' type='button' class='btn btn-outline-secondary'>Remove</button>"); 
            
                document.getElementById('recipeList').insertBefore(fragment, document.getElementById('recipeList').childNodes[0]);
                //document.body.insertBefore(fragment, /*document.body.childNodes[0]*/ document.getElementById('recipeList'));

                var edit_btn = document.getElementById('edit'+'_'+temp_recipe_id_string);
                var remove_btn = document.getElementById('remove'+'_'+temp_recipe_id_string);

                //Design: 
                //  This should fill the recipe page and send the user to recipe.html
                edit_btn.onclick = function(element) 
                {
                    window.location.href="../views/recipe.html?recipe_name="+data[temp_recipe_id_string].recipe_name+"&recipe_description="+data[temp_recipe_id_string].recipe_description+"&recipe_id="+temp_recipe_id_string+"";
                    //.search   → '?filter=JS'
                    //Problem: I need to fill recipe.html
                };

                //Design:
                //  This should remove the recipe data and reload recipe_list.html
                remove_btn.onclick = function(element) 
                {
                    chrome.storage.sync.remove([key], function(result) {
                        console.log('key being removed currently is ' + result.key);
                      });
                      chrome.storage.sync.get('number_of_recipes', function(data) {
                        var num_of_recipes = data.number_of_recipes-1;
                
                        chrome.storage.sync.set({'number_of_recipes' : num_of_recipes}, function() {
                            // Notify that we saved.
                            //message('Settings saved');
                        });
                    });
                    window.location.href="../views/recipe_list.html";
                };

                  });
        });
});


var add_btn = document.getElementById('add');
var back_btn = document.getElementById('back');

//Design:
//  This should send the user to a blank recipe.html
add_btn.onclick = function(element) 
{
    window.location.href="../views/recipe.html?recipe_name="+"test"+"&recipe_description="+"test"+"&recipe_id="+undefined+"";
    //Potential Solution: I may be able to pass data this way
    //Problem: I need to go to a blank recipe.html
};

back_btn.onclick = function(element) 
{
    window.location.href="../views/popup.html"
};





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