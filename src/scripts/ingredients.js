/*

    File: Ingredients.js
    Purpose: 

      [] - List all ingredients from all recipes

      [] - The list should automatically add measurement values together for the same product 
           if it gets used in two or more recipes

*/

import {fadeInUpAnimation,fadeOutDownAnimation,initializeAnimation } from './page_transitions.js';

//This dictionary holds all the information received from wit.ai
var dict = {};

var promises = [];

// This is the second parsing phase of the wit.ai request.
// Once wit has sent its parse of the ingredient we can make educated decisions on how to categorize data.
// This function will create add or update something in the dictionary
async function GenerateRow(res)
{
  //If the result from wit is blank or undefined then just terminate the function call
  if(res == null || res == undefined)
  {
    return;
  }

  // The name of an ingredient in the recipe
  var product = undefined;

  // Limitation: It is assumed that if a measurement is not received from wit than the product doesnt need one
  // Example: 1 tomato is just a whole tomato.
  // Note: Originally undefined
  var measurement = "whole";//"whole";

  var measurement_found = false;
  
  // The amount of the measurement
  // Note: Originally undefined
  var amount = "";
  
  // TODO: this isnt being used yet
  var note = "";
  
  // Limitation: It is assumed that if a measurement is not received from wit than the product doesnt need one
  // Example: 1 tomato is just a whole tomato.
  // Note: Originally undefined
  // Amount and Quantity are synonymous.
  var quantity_measurement = "whole";
  
  // The amount of the measurement
  // Note: Originally undefined
  // Amount and Quantity are synonymous.
  var quantity_amount = 1;
  
  // This keeps track of whether wit found an "amount" entity.
  var amount_found = false;
  
  // This keeps track of whether wit found a "quanitity" entity.
  var quantity_found = false;
  
  // Iterate through the entities received from wit.ai
  Object.keys(res.entities).forEach(function(key) 
  {
    var entity_name = res.entities[key][0].name;
    var entity_value = res.entities[key][0].value;

    // Check which entity name was received
    if(entity_name == "measurement")
    {
      measurement = entity_value;
    }
    else if(entity_name == "product")
    {
      product = entity_value;
    }
    else if(entity_name == "wit$quantity")
    {
      //  Note: 
      //  Problem could exist here where quantity and measurement are in the same query.
      //  The quantity entity has both unit and value fields.
      //  Treating quantity and measurement/amount synonymous is currently a bug on the wit.ai side.
      quantity_measurement = res.entities[key][0].unit;
      quantity_amount = entity_value;
      quantity_found = true;
    }
    else if(entity_name == "wit$distance")
    {
      // THIS IS A BANDAID TO TEST WHETHER DISTANCE WORKS 
      quantity_measurement = res.entities[key][0].unit;
      quantity_amount = entity_value;
      quantity_found = true;
    }
    else if(entity_name == "note")
    {
      note = entity_value;
    }
    else 
    {
      //  Note:
      //  This else case catches any other entities. Mostly just wit$number and amount. Only numbers for now.
      amount_found = true;
      amount = entity_value;
    }
  });

  //  _                     _       _     _ 
  // | |                   | |     (_)   | |
  // | |__   __ _ _ __   __| | __ _ _  __| |
  // | '_ \ / _` | '_ \ / _` |/ _` | |/ _` |
  // | |_) | (_| | | | | (_| | (_| | | (_| |
  // |_.__/ \__,_|_| |_|\__,_|\__,_|_|\__,_|
  // 
  // Logic is needed to see if quantity and amount were found in query
  if(quantity_found && amount_found)
  {
    // Testing a new strategy
    var regexp = new RegExp(amount,"gi");
    var amount_count = res.text.match(regexp).length;
    
    const fraction_regex = new RegExp(/[0-9]*\.?[0-9] *[1-9][0-9]*\/[1-9][0-9]*/gi);
    var fraction_edge_case = res.text.match(fraction_regex);

    if(fraction_edge_case.length > 0)
    {
      measurement = quantity_measurement;
      amount = quantity_amount + amount;
    }
    else if(amount_count > 1 || (amount != quantity_amount))
    {
      measurement = "(" + quantity_amount + " " + quantity_measurement + " Per " + measurement + ")";
    }
    else
    {
      measurement = quantity_measurement;
      amount = quantity_amount
    }
  }
  else if(quantity_found)
  {
    measurement = quantity_measurement;
    amount = quantity_amount;
  }
  else if(amount_found)
  {
    // Nothing currently
  }
  else 
  {
    // Nothing currently
  }



  if((measurement == "whole" && amount == ""))
  {
    if(!("To Taste & Etc" in dict))
    {
      // Purpose: To catch sitations like salt, pepper, tomato, 
      dict["To Taste & Etc"] = {[res.text]: "" };
    }
    else
    {
      (dict["To Taste & Etc"])[res.text] = "";
    }
  }
  // Add product to dictionary with the measurement and amount if its not in the dictionary
  else if(!(product in dict))
  {
    
    dict[product] = {[measurement] : numericQuantity(amount)};
  }
  else
  {
    // Check if the measurement has already been added into the dictionary
    if(measurement in dict[product])
    {
      //https://www.npmjs.com/package/numeric-quantity
      //https://www.npmjs.com/package/parse-ingredient
      (dict[product])[measurement] = numericQuantity((dict[product])[measurement]) + numericQuantity(amount);
    }
    else
    {
      // Add new measurement to existing product
      (dict[product])[measurement] = numericQuantity(amount);//amount
    }
  }
};

// Text area displays the ingredients 
var text_area = document.getElementById('ingredientsDescription');
// Back button to go back
var back_btn = document.getElementById('back');

// Go back to the default page
back_btn.onclick = function(element) 
{
  fadeOutDownAnimation("../views/popup.html");
};


async function functionOne() 
{
  return new Promise((resolve, reject) => 
  {
    // Get the number of recipes stored in local storage
    chrome.storage.sync.get('number_of_recipes', function(data) 
    {
      // The number of recipes in storage
      var number_of_recipes = data.number_of_recipes;

      chrome.storage.sync.get('recipe_id_list',function(list){resolve(list.recipe_id_list);});
    });
  })
};

async function functionTwo(recipe_list)
{
  return new Promise((resolve, reject) => 
  {
    // Get the recipe list out of local storage
    chrome.storage.sync.get(recipe_list , function(data) {resolve(data); });
  });
}

// Listener for content script message or backgorund script message
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) 
  {
      
  }
);


async function fillList()
{
  // Iterate through the dictionary of recipe information    
  Object.keys(dict).forEach(function(key) 
  {
    // Insert product name into the grocery list text area
    text_area.value += key + "\n"

    // Iterate through each measurement of the product
    Object.keys(dict[key]).forEach(function(second_key)
    {
      // Insert number of measurements for the product
      text_area.value += "• " + (dict[key])[second_key] + " " + second_key + "\n";
    });

    // Move on to the next ingredient
    text_area.value += "\n";
  })

  // Make menu visible
  document.getElementById('mainMenu').style.visibility = "visible";

  // Make loading div hidden
  document.getElementById('loading-wrapper').style.visibility = "hidden";

  //
  fadeInUpAnimation();
};

functionOne().then(data=>
{
  // The list of all recipes
  var recipe_list = data;

  functionTwo(recipe_list).then(data=>
  {
    //  _                     _       _     _ 
    // | |                   | |     (_)   | |
    // | |__   __ _ _ __   __| | __ _ _  __| |
    // | '_ \ / _` | '_ \ / _` |/ _` | |/ _` |
    // | |_) | (_| | | | | (_| | (_| | | (_| |
    // |_.__/ \__,_|_| |_|\__,_|\__,_|_|\__,_|
    // 
    // Description: 
    // This functionality writes to the text area multiple times.
    // Currently it is not efficient. A new promise structure
    // needs to be configured in order to write to text area
    // only once.
    // Iterate through each recipe
    Object.keys(data).forEach(key => 
    {
      // Parse each ingredient by the return character
      var each_ingredient = data[key].recipe_description.split('\n');

      functionThree(each_ingredient).then(data=>{  });
    });
  });
});

async function functionThree(each_ingredient)
{
  return new Promise((resolve, reject) => 
  {
        var fetchPromises =[];
        const auth = 'Bearer ' + 'GKTBGOKLKBEQA26XNZSLM6SSNU4A7XJR';
        // Make a wit.ai request for each ingredient
        each_ingredient.forEach( row => 
        {
          // THERE IS A BUG I NEED TO HANDLE FOR BLANK ENTRIES THAT BREAKS MY SCRIPT
          if (row != "" && row != undefined)
          {
            // This is the ingredient string
            // Example: "3 cups of honey"
            const q = encodeURIComponent(row);
            
            // Keys needed to run this. Keeping this data in private for now.
            // HTTP request for wit.ai to parse the ingredient string
            const uri = 'https://api.wit.ai/message?v=20210122&q=' + q;
            
            var myfunc = fetch(uri, {headers: {Authorization: auth}})
            
            fetchPromises.push(myfunc);
          }
        });
        
        Promise.all(fetchPromises).then(function (responses) 
        {
          // Get a JSON object from each of the responses
          return Promise.all(responses.map(function (response) {return response.json();}));
        }).then(function (data) 
        {
          data.forEach(row=> 
          {
            GenerateRow(row);
          });
        })
        .then(function(data)
        {
          text_area.value = "";
          fillList().then(idk=>{});
        })
        .catch(function (error) 
        {
          // if there's an error, log it
          console.log(error);
        });

        resolve(dict);
  });
}

//https://www.whateatly.com/list-of-vegetables/
