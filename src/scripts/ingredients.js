
var dict = {};

function GenerateRow(res)
{
  
  if(res == null || res == undefined)
  {
    return;
  }

  var product = undefined;
  var measurement = "whole";//originally undefined
  var amount = 1;//originally undefined
  var note = "";
  var quantity_measurement = "whole";
  var quantity_amount = 1;

  var amount_found = false;
  var quantity_found = false;
  
  //console.log(res.entities[0]/*+ " " + res.entities.measurement + " " + res.entities.product*/)
  Object.keys(res.entities).forEach(function(key) {
    //console.log(res.entities[key][0].name)
    
    var entity_name = res.entities[key][0].name;
    var entity_value = res.entities[key][0].value;
    console.log(res.entities[key][0]);

    if(entity_name == "measurement")
    {
      //console.log(entity[0].value);
      measurement = entity_value;
    }
    else if(entity_name == "product")
    {
      product = entity_value;
      //console.log(entity[0].value);
    }
    else if(entity_name == "wit$quantity")
    {
      //problem could exist here where quantity and measurement are in the same query
      quantity_measurement = res.entities[key][0].unit;

      quantity_amount = entity_value;

      quantity_found = true;
    }
    else if(entity_name == "note")
    {
      note = entity_value;
    }
    else //wit$number, amount, just numbers for now
    {
      amount_found = true;
      amount = entity_value;
      //console.log(entity[0].value);
    }

    //This is where i need to figure out an algorithm to mix this data together
    // text_area.value += 
    
    //console.log(dict);
  });

  //logic is needed to see if quanity and amount were found in query
  //there should be a strategy to find best solution
  if(quantity_found && amount_found && (quantity_amount != amount))
  {
    measurement = quantity_measurement;
    amount = quantity_amount * amount;
  }
  else if(quantity_found)
  {
    measurement = quantity_measurement;
    amount = quantity_amount;
  }
  else if(amount_found)
  {
    //nothing?
  }
  else // neither was found
  {
    //nothing?
  }


  if(!(product in dict)/*dict[product] == undefined*/)
  {
    dict[product] = {[measurement] : amount};
    // dict[product] = '• ' + amount + " " + measurement;
  }
  else
  {
    if(measurement in dict[product])
    {
      //PROBLEM: dangerous to just add amount without checking it
      (dict[product])[measurement] += amount
    }
    else
    {
      (dict[product])[measurement] = amount;
    }
    //dict[product] = dict[product] + "\n• " + amount + " " + measurement;  

  }

  // Object.keys(dict).forEach(function(key) {
  //   console.log(key+ " = " + dict[key]);
  //   text_area.value += key+ " = " + dict[key] + "\n";
  // });
    
};

function WitRequest(ingredient_string) 
{
  const q = encodeURIComponent(ingredient_string);//'2 tablespoon apple');
  //Keys needed to run this
  const uri = undefined;
  const auth = undefined;
  fetch(uri, {headers: {Authorization: auth}})
      .then(res => res.json()
      )
      .then(res => 
        GenerateRow(res)
      )
};



var text_area = document.getElementById('ingredientsDescription');

var back_btn = document.getElementById('back');

back_btn.onclick = function(element) 
{
    window.location.href="../views/popup.html"
};

chrome.storage.sync.get('number_of_recipes', function(data) {
  var number_of_recipes = data.number_of_recipes;
  console.log("number_of_recipes:"+number_of_recipes);
  
  var recipe_list = [];
  for(var i = 0;i< number_of_recipes; i++)
  {
      console.log("iteration:"+i);
      var recipe_id_string = 'recipe_id_' + (i+1);
      recipe_list.push(recipe_id_string);
  }


          text_area.value = "";
          //Variables cannot be used as keys without using computed keys, new in ES6.
          chrome.storage.sync.get(recipe_list , function(data) 
          {
              Object.keys(data).forEach(key => {

                  var temp_recipe_id_string = key;//recipe_id_string;

                  //console.log(key, data[key]);
                  
                  //console.log(data[key].recipe_description);

                  var each_ingredient = data[key].recipe_description.split('\n');

                  each_ingredient.forEach( row => {
                    WitRequest(row);
                  });

                  //text_area.value += data[key].recipe_description+"\n";
                
                });
      });
});


// var show_ingredients_btn = document.getElementById('showIngredients');
// var show_recipes_btn = document.getElementById('showRecipes');


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

setTimeout(() => {
  Object.keys(dict).forEach(function(key) {
    //console.log(key+ " = " + dict[key]);
    text_area.value += key + "\n"
    //dict[product] = dict[product] + "\n• " + amount + " " + measurement;  
    Object.keys(dict[key]).forEach(function(second_key){
      console.log(dict[key]);
      text_area.value += "• " + (dict[key])[second_key] + " " + second_key + "\n";
    });
    text_area.value += "\n";
  })
}, 6000);