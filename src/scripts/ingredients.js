/*

    File: Ingredients.js
    Purpose: 

      [] - List all ingredients from all recipes

      [] - The list should automatically add measurement values together for the same product 
           if it gets used in two or more recipes

*/

// Import the page animations that get used between page transitions
import {fadeInUpAnimation,fadeOutDownAnimation,initializeAnimation } from './page_transitions.js';

//This dictionary holds all the information received from wit.ai
var dict = {};

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
  var measurement = "whole";
  
  // The amount of the measurement
  // Note: Originally undefined
  var amount = "";
  
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
    // Access current entity name
    var entity_name = res.entities[key][0].name;

    // Access current entity value
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
      var note = entity_value;
    }
    else 
    {
      //  Note:
      //  This else case catches any other entities. Mostly just wit$number and amount. Only numbers for now.
      amount_found = true;
      amount = entity_value;
    }
  });

  // This large code block is mainly used for special edge cases
  // Logic is needed to see if quantity and amount were found in query
  if(quantity_found && amount_found)
  {
    // Regular expression to search for the occurances of amount
    var reg_exp = new RegExp(amount,"gi");
    var amount_count = res.text.match(reg_exp).length;
    
    // Regular expression to search for fractions
    // Note: This allows us to find a special edge case where a recipe states
    // Something like: 2 1/2 cups of ....
    // It may be something that can be handled different in the future
    const fraction_regex = new RegExp(/[0-9]*\.?[0-9] *[1-9][0-9]*\/[1-9][0-9]*/gi);
    var fraction_edge_case = res.text.match(fraction_regex);

    if(fraction_edge_case != null && fraction_edge_case.length > 0)
    {
      // Add the 'quantity amount' and the 'amount' together
      // if the faction edge case was found
      measurement = quantity_measurement;
      amount = quantity_amount + amount;
    }
    else if(amount_count > 1 || (amount != quantity_amount))
    {
      // Edge case where a recipe states something like:
      // 2 (8 oz) cans of stuff
      measurement = "(" + quantity_amount + " " + quantity_measurement + " Per " + measurement + ")";
    }
    else
    {
      // This is the case where 'amount' and 'quantity' were both found by WIT
      // but WIT categorized the same words twice
      // This seems like a bug/bandaid so it may change in the future
      measurement = quantity_measurement;
      amount = quantity_amount
    }
  }
  else if(quantity_found)
  {
    // This is a standard case, such as "2 lbs of tomatoes"
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
    // This is a special edge case where a specific amount and measurement were not provided
    // Its mainly for recipes that mention ingredients "To Taste"
    // If "To Taste & Etc" has never been added to the dictionary
    // Note: This is somewhat of a bandaid but it works great for now
    if(!("To Taste & Etc" in dict))
    {
      // Purpose: To catch sitations like salt, pepper, tomato, 
      dict["To Taste & Etc"] = {[res.text]: "" };
    }
    else
    {
      // Add a new text entry to the existing "To Taste & Etc" key
      (dict["To Taste & Etc"])[res.text] = "";
    }
  }
  else if(!(product in dict))
  {
    // Add product to dictionary with the measurement and amount if its not in the dictionary
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
      (dict[product])[measurement] = numericQuantity(amount);
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
  // Fade out and transition page
  fadeOutDownAnimation("../views/popup.html");
};

// Retrieves the recipe id list as an async function
async function awaitForRecipeIDList() 
{
  return new Promise((resolve, reject) => 
  {
    // Get the number of recipes stored in local storage
    // NOTE: This first call probably doesnt need to be called
    chrome.storage.sync.get('number_of_recipes', function(data) 
    {
      chrome.storage.sync.get('recipe_id_list',function(list){resolve(list.recipe_id_list);});
    });
  })
};

// Retrieves the recipe list as an async function
async function awaitForRecipeList(recipe_list)
{
  return new Promise((resolve, reject) => 
  {
    // Get the recipe list out of local storage
    chrome.storage.sync.get(recipe_list , function(data) {resolve(data); });
  });
}

// Listener for content script message or backgorund script message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {});

// Writes the ingredient list to the text area
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

  // Once text area has data written to it, allow the page to fade in and hide the loading gif
  fadeInUpAnimation();
};

// Start process for making fetch requests to WIT API and parsing data into the ingredient text area
awaitForRecipeIDList().then(data=>
{
  // The list of all recipes
  var recipe_list = data;

  // Pull recipe list and start the process of making WIT API requests
  awaitForRecipeList(recipe_list).then(data=>
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

      // Execute fetch requests to WIT API for each ingredient in each recipe
      awaitForWITReponse(each_ingredient).then(data=>{});
    });
  });
});

// Executes multiple fetch requests to the WIT API
// This is via an async function to wait for all requests to be complete
// before displaying the generated grocery list
async function awaitForWITReponse(each_ingredient)
{
  return new Promise((resolve, reject) => 
  {
    // Used to collect all promises into one list
    var fetchPromises =[];

    // The API code used to make requests to Food Bro
    // Food Bro is the name of the WIT API bot
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
        
        // Create fetch function with a unique uri
        var fetch_func = fetch(uri, {headers: {Authorization: auth}})
        
        // Push fetch function into the list of promises
        fetchPromises.push(fetch_func);
      }
    });
    
    // Await for all promises to be resolved
    Promise.all(fetchPromises).then(function (responses) 
    {
      // Get a JSON object from each of the responses
      return Promise.all(responses.map(function (response) {return response.json();}));
    }).then(function (data) 
    {
      data.forEach(row=> 
      {
        // Parse WIT response for each ingredient
        GenerateRow(row);
      });
    })
    .then(function(data)
    {
      // Clear text area before filling the text area
      // This is a big bandaid currently, due to the list being filled multiple times
      text_area.value = "";
      fillList().then(idk=>{});
    })
    .catch(function (error) 
    {
      // if there's an error, log it
      console.log(error);
    });

    // Resolve the promise and return dict
    resolve(dict);
  });
}

//https://www.whateatly.com/list-of-vegetables/
var veggie_dictionary = {
'Acorn Squash': null,
'Ahipa': null,
'Amaranth': null,
'American Groundnut': null,
'Aonori': null,
'Arame': null,
'Arracacha': null,
'Arrowroot': null,
'Artichoke': null,
'Arugula': null,
'Asparagus': null,
'Adzuki Bean': null,
'Bamboo Shoots': null,
'Banana Squash': null,
'Beetroot': null,
'Belgian Endive': null,
'Bell Peppers': null,
'Black Eyed Pea': null,
'Black Radish': null,
'Black Salsify': null,
'Bok Choy': null,
'Broadleaf Arrowhead': null,
'Broccoflower': null,
'Broccoli': null,
'Broccolini': null,
'Brussel Sprouts': null,
'Burdock Roots': null,
'Buttercup Squash': null,
'Butternut Squash': null,
'Cabbage': null,
'Cactus': null,
'Camas': null,
'Canna': null,
'Caper': null,
'Cardoon': null,
'Carrot': null,
'Cassava': null,
'Catsear': null,
'Cauliflower': null,
'Celeriac': null,
'Celery': null,
'Celtuce': null,
'Chaya': null,
'Chayote Squash': null,
'Cherry Tomato': null,
'Chick Pea': null,
'Chickweed': null,
'Chicory': null,
'Chives': null,
'Chrysanthemum': null,
'Collard Greens': null,
'Common Beans': null,
'Crookneck Squash': null,
'Common Purslane': null,
'Courgette Flowers': null,
'Cress': null,
'Cucumbers': null,
'Dabberlocks': null,
'Daikon': null,
'Dandelion': null,
'Delicata Squash': null,
'Daylily': null,
'Dill': null,
'Dolichos': null,
'Drumstick': null,
'Dulse': null,
'Earthnut Pea': null,
'Eggplant': null,
'Elephant Foot Yam': null,
'Elephant Garlic': null,
'Endive': null,
'Ensete': null,
'Fat Hen': null,
'Fava bean': null,
'Fennel': null,
'Fiddlehead Green': null,
'Florence Fennel': null,
'Fluted Pumpkin': null,
'Galangal': null,
'Garbanzo': null,
'Garden Rocket': null,
'Garlic': null,
'Garlic Chives': null,
'Ginger': null,
'Golden Samphire': null,
'Good King Henry': null,
'Greater Plantain': null,
'Green Beans': null,
'Green Soybeans': null,
'Guar': null,
'Hamburg Parsley': null,
'Hijiki': null,
'Horse Gram': null,
'Horseradish': null,
'Indian Pea': null,
'Kale': null,
'Kohlrabi': null,
'Komatsuna': null,
'Kombu': null,
'Kurrat': null,
'Lagos Bologi': null,
'Land Cress': null,
'Laver': null,
'Leek': null,
'Lemongrass': null,
'Lentil': null,
'Lettuce': null,
'Lima Bean': null,
'Lotus Root': null,
'Malabar Spinach': null,
'Mangetout': null,
'Manoa': null,
'Mashua': null,
'Mulukhiyah': null,
'Mizuna': null,
'Morel Mushrooms': null,
'Moth Bean': null,
'Mozuku': null,
'Mung Bean': null,
'Mushrooms': null,
'Mustard Greens': null,
'Napa Cabbage': null,
'New Zealand Spinach': null,
'Nopal': null,
'Nori': null,
'Ogonori': null,
'Okra': null,
'Onion': null,
'Orache': null,
'Pak Choy': null,
'Paracress': null,
'Parsnip': null,
'Peas': null,
'Pearl Onion': null,
'Pigeon Pea': null,
'Pignut': null,
'Potato': null,
'Prussian Asparagus': null,
'Prairie Turnip': null,
'Pumpkin': null,
'Radicchio': null,
'Radish': null,
'Ramp': null,
'Rapini': null,
'Red Leaf Lettuce': null,
'Ricebean': null,
'Runner Bean': null,
'Rutabaga': null,
'Salad Savoy': null,
'Salsify': null,
'Samphire': null,
'Scorzonera': null,
'Sculpit': null,
'Sea Beet': null,
'Sea Grape': null,
'Sea Kale': null,
'Sea Lettuce': null,
'Shallot': null,
'Sierra Leone Bologi': null,
'Skirret': null,
'Snap Pea': null,
'Snow Pea': null,
'Soko': null,
'Sorrel': null,
'Sour Cabbage': null,
'Soybean': null,
'Spinach': null,
'Spring Onion': null,
'Scallion': null,
'Squash Blossoms': null,
'Summer Squash': null,
'Swede': null,
'Sweet Potato': null,
'Taro': null,
'Tarwi': null,
'Tatsoi': null,
'Tepary Bean': null,
'Tigernut': null,
'Tomatillo': null,
'Tomato': null,
'Tree Onion': null,
'Turmeric': null,
'Turnip': null,
'Urad Bean': null,
'Ulluco': null,
'Wasabi': null,
'Water Chestnut': null,
'Water Caltrop': null,
'Water Spinach': null,
'Watercress': null,
'Welsh Onion': null,
'Wheatgrass': null,
'Wild Leek': null,
'Winged Bean': null,
'Winter Squash': null,
'Yam': null,
'Yao Choy': null,
'Yardlong Bean': null,
'Yarrow': null,
'Yuca Root': null,
'Yukon Gold Potatoes': null,
'Zucchini': null
};