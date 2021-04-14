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

  var current_entities_category =  "Etc";
  
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

      // For now the first entity is what is going to determine the category
      // Assuming this will change eventually
      console.log("Checking entity json structure");
      console.log(res.entities[key][0]);
      console.log(res.entities);

      if(res.entities[key][0].entities[0] != null)
      {
        let store_location = res.entities[key][0].entities[0].name;
        
        // Check if the current measurement indicates a "Dry Goods" Item
        if( store_location == "vegetable")
        {
          current_entities_category = store_location; 
        }
        else if (store_location == "fruit")
        {
          current_entities_category = store_location; 
        }
        else if(store_location == "meat")
        {
          current_entities_category = store_location; 
        }
        else if (store_location == "fridge")
        {
          current_entities_category = store_location; 
        }
        else if (store_location == "seafood")
        {
          current_entities_category = store_location; 
        }
        else if (store_location == "Freezer")
        {
          current_entities_category = store_location; 
        }
        else
        {
          current_entities_category = "etc";
        }

        if(res.entities['measurement:measurement'] != null)
        {
          let dry_good_check = res.entities['measurement:measurement'][0].value.includes("can") ||
                               product.includes("oil") || product.includes("sauce") || product.includes("chip") || 
                               product.includes("powder") || product.includes("juice");
          
          if ( dry_good_check == true )
          {
            current_entities_category = "etc"//"dry goods";
          }
        }
      }
      else
      {
        let dry_good_check = product.includes("oil") || product.includes("sauce") || product.includes("chip") || product.includes("juice");

        if ( dry_good_check == true )
        {
          current_entities_category = "etc"//"dry goods";
        }
        else
        {
          current_entities_category = "etc";
        }
      }

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
      dict["To Taste & Etc"] = {[res.text]:  current_entities_category};
      //dict["To Taste & Etc"]["category"] = "etc";
      //dict[product]["category"] = current_entities_category;
    }
    else
    {
      // Add a new text entry to the existing "To Taste & Etc" key
      (dict["To Taste & Etc"])[res.text] = current_entities_category;
    }
  }
  else if(!(product in dict))
  {
    // Add product to dictionary with the measurement and amount if its not in the dictionary
    dict[product] = {[measurement] : numericQuantity(amount)};
    dict[product]["category"] = current_entities_category;
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
//var text_area = document.getElementById('ingredientsDescription');
var vegetable_list = document.getElementById('vegetable');
var fruit_list = document.getElementById('fruit');
var meat_list = document.getElementById('meat');
var fridge_list = document.getElementById('fridge');
var seafood_list = document.getElementById('seafood');
var freezer_list = document.getElementById('freezer');
var dry_list = document.getElementById('dry goods');
var etc_list = document.getElementById('etc');

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
  
  // switch(dict[key]["category"])
  // {
  //   case "vegetable":
  //     break;
  //   case "fruit":
  //     break;
  //   case "meat":
  //     break;
  //   case "fridge":
  //     break;
  //   case "seafood":
  //     break;
  //   case "freezer":
  //     break;
  //   case "dry goods":
  //     break;
  //   case "etc":
  //     break;
  // }
  // Iterate through the dictionary of recipe information    
  Object.keys(dict).forEach(function(key) 
  {
    // console.log("What?");
    // console.log(key);
    // console.log("category?");
    // console.log(dict[key]["category"]);

    /* 
    
    I need to find a good strategy to put "to taste" with the correct category

    The "To Taste & Etc" structure needs to be fixed because its really messy
    Also "category" should be handled differently
    */
    let current_text_area;

    if(key == "To Taste & Etc")
    {
      Object.keys(dict[key]).forEach(function(second_key)
      {
        current_text_area = document.getElementById((dict[key])[second_key]); 
        console.log(key);
        console.log(dict[key]) ;
        console.log(second_key);
        console.log((dict[key])[second_key]);
        current_text_area.value += key + "\n";
        current_text_area.value += "• " + second_key + "\n";

      });
    }
    else
    {
      current_text_area = document.getElementById(dict[key]["category"]); 
      
      current_text_area.value += key + "\n";

      // Iterate through each measurement of the product
      Object.keys(dict[key]).forEach(function(second_key)
      {
        if(second_key != "category")
        {
          // Insert number of measurements for the product
          current_text_area.value += "• " + (dict[key])[second_key] + " " + second_key + "\n";
        }
      });
    }

    // Move on to the next ingredient
    current_text_area.value += "\n";
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
      //text_area.value = "";
      vegetable_list.value = "";
      fruit_list.value = "";
      meat_list.value = "";
      fridge_list.value = "";
      seafood_list.value = "";
      freezer_list.value = "";
      dry_list.value = "";
      etc_list.value = "";
      fillList().then(idk=>{
        
      });
    })
    .then(function(data)
    {
      if(vegetable_list.value == "")
      {
        document.getElementById('veggie_div').remove();
      }
  
      if(fruit_list.value == "")
      {
        document.getElementById('fruit_div').remove();
      }
  
      if(meat_list.value == "")
      {
        document.getElementById('meat_div').remove();
      }
  
      if(fridge_list.value == "")
      {
        document.getElementById('fridge_div').remove();
      }

      if(etc_list.value == "")
      {
        document.getElementById('etc_div').remove();
      }
  
      if(seafood_list.value == "")
      {
        document.getElementById('seafood_div').remove();
      }
  
      if(freezer_list.value == "")
      {
        document.getElementById('freezer_div').remove();
      }

      if(dry_list.value == "")
      {
        document.getElementById('dry_goods_div').remove();
      }
    })
    .catch(function (error) 
    {
      // if there's an error, log it
      console.log(error);
    });

    

    // Resolve the promise and return dict
    resolve(dict);
    initializeAnimation();
  });
}

//https://www.whateatly.com/list-of-vegetables/
// Synonyms for other veggies are listed
// Some veggies are listed as "Not Common". These are lower priority veggies that 
// im not planning to train for now
var veggie_dictionary = {
'Acorn Squash': null, // pepper squash, Des Moines squash
'Ahipa': null, // Not common
'Amaranth': null, // Not common, but like gronaola recipes
'American Groundnut': null, // Not common
'Aonori': null, // Not common, but this is seaweed
'Arame': null, // Not common 
'Arracacha': null, // Not common
'Arrowroot': null, // Not common
'Artichoke': null, // globe artichoke, French artichoke, green artichoke
'Arugula': null, // other names determined to be unimportant
'Asparagus': null, // garden asparagus, sparrow grass
'Adzuki Bean': null, // red bean
'Bamboo Shoots': null, // bamboo sprouts
'Banana Squash': null, // Not commom
'Beetroot': null, // Beet, table beet, garden beet, red beet, dinner beet, golden beet
'Belgian Endive': null, // Endive
'Bell Peppers': null, // sweet pepper, pepper, capsicum
'Black Eyed Pea': null, // other names determined to be unimportant
'Black Radish': null,// other names determined to be unimportant
'Black Salsify': null, // Not Common
'Bok Choy': null, // other names determined to be unimportant
'Broadleaf Arrowhead': null, // Not Common
'Broccoflower': null, // Green cauliflower, Romanesco, Romanesco broccoli
'Broccoli': null, // other names determined to be unimportant
'Broccolini': null, // baby broccoli
'Brussel Sprouts': null, // other names determined to be unimportant
'Burdock Roots': null, // Not Common
'Buttercup Squash': null, // Not Common
'Butternut Squash': null, // butternut pumpkin, gramma
'Cabbage': null, // green cabbage, red cabbage, white cabbage
'Cactus': null, // Not Common
'Camas': null, // Not Common
'Canna': null, // Not Common
'Caper': null, // Weird edge case, typically pickeld, does have a few different names
'Cardoon': null, // Not Common
'Carrot': null, // purple, black, red, white, yellow, orange, wild carrot
'Cassava': null, // Not Common
'Catsear': null, // Not Common
'Cauliflower': null, // other names determined to be unimportant
'Celeriac': null, // Celery root, knob celery, turnip-rooted celery
'Celery': null, // other names determined to be unimportant
'Celtuce': null, // stem lettuce, celery lettuce, asparagus lettuce, Chinese lettuce
'Chaya': null, // Not Common
'Chayote Squash': null, // Not Common
'Cherry Tomato': null,// plum tomatoes and grape tomatoes are really similiar
'Chick Pea': null,// garbanzo,garbanzo bean, Egyptian pea,gram?
'Chickweed': null, // Not Common
'Chicory': null, // Not Common
'Chives': null, // other names determined to be unimportant
'Chrysanthemum': null, // Not Common
'Collard Greens': null, // Collard
'Corn' : null, //
'Common Beans': null, // French Bean
'Crookneck Squash': null, //yellow squash, summer squash, yellow crookneck squash
'Common Purslane': null, // Not Common
'Courgette Flowers': null, // Not Common
'Cress': null, // https://en.wikipedia.org/wiki/Cress not sure
'Cucumbers': null, //No other names but keep track of things that could be "pickled"
'Dabberlocks': null, // Not Common
'Daikon': null, // Daikon Radish
'Dandelion': null, // Not Common
'Delicata Squash': null, // peanut squash, Bohemian squash, sweet potato squash
'Daylily': null, // Not Common
'Dill': null, // other names determined to be unimportant
'Dolichos': null,// Not Common
'Drumstick': null, // Not Common
'Dulse': null, // Not Common
'Earthnut Pea': null, // Not Common
'Eggplant': null, // aubergine, brinjal
'Elephant Foot Yam': null, // Not Common
'Elephant Garlic': null, // Not Common
'Endive': null, // other names, may have listed as synonym before
'Ensete': null, // Not Common
'Fat Hen': null, // Not Common
'Fava bean': null, //  broad bean, faba bean, probably canned or dry good
'Fennel': null, // other names determined to be unimportant
'Fiddlehead Green': null, // Not Common
'Florence Fennel': null, // Fennel
'Fluted Pumpkin': null, // Not Common
'Galangal': null, // Not Common
'Garbanzo': null, // covered already
'Garden Rocket': null, // arugula, if not alraedy covered
'Garlic': null, // other names determined to be unimportant
'Garlic Chives': null, // Not Common
'Ginger': null, // ginger root
'Golden Samphire': null, // Not Common
'Good King Henry': null, // Not Common
'Greater Plantain': null, // Not Common
'Green Beans': null, // French beans, string beans, snap beans, snaps, baguio beans
'Green Soybeans': null, // Edamame
'Guar': null, // Not Common
'Hamburg Parsley': null, // Parsley, Garden Parsley, Curly leaf parsley, Flat leaf parsley, root parsley
'Hijiki': null, // Not Common
'Horse Gram': null, // Not Common
'Horseradish': null, // other names determined to be unimportant
'Indian Pea': null, // Not Common
'Kale': null, // other names determined to be unimportant
'Kohlrabi': null, // cabbage turnip, german turnip
'Komatsuna': null, // Not Common
'Kombu': null, // Kelp
'Kurrat': null, // Not Common
'Lagos Bologi': null, // Not Common
'Land Cress': null, // Not Common
'Laver': null, // Seaweed
'Leek': null, // other names determined to be unimportant
'Lemongrass': null, // other names determined to be unimportant
'Lentil': null, // Puy Lentil, Green Lentil, Red Lentil
'Lettuce': null, // Romaine Lettuce, Head Lettuce, Loose-leaf lettuce, iceberge lettuce, butterhead lettuce, bibb lettuce, a few other names
'Lima Bean': null, // butter bean, sieva bean, double bean, madagascar bean, chad bean, wax bean
'Lotus Root': null, // Not Common
'Malabar Spinach': null, // Not Common
'Mangetout': null, // another name for snap pea, sugar pea, snow pea?
'Manoa': null, // Not Common
'Mashua': null, // Not Common
'Mulukhiyah': null, // Not Common
'Mizuna': null, // water greens, kyona, japanese mustard greens, spider mustard
'Morel Mushrooms': null, // other names determined to be unimportant
'Moth Bean': null, // Not Common
'Mozuku': null, // Not Common
'Mung Bean': null, // Not Common
'Mushrooms': null, // tons of different names
'Mustard Greens': null, // tons of different names
'Napa Cabbage': null, // Napa, chinese cabbage
'New Zealand Spinach': null, // Not Common
'Nopal': null, // Not Common
'Nori': null, // This is more of a dried good
'Ogonori': null, // Not Common
'Okra': null, // ladies' fingers, ochro
'Onion': null, // bulb onion, common onion, tons of different names
'Orache': null, // Not Common
'Pak Choy': null, // already covered, also called bok choy
'Paracress': null, // other names determined to be unimportant
'Parsnip': null, // Not Common
'Peas': null, // already covered
'Pearl Onion': null, // other names determined to be unimportant also can be canned
'Pigeon Pea': null, // Not Common
'Pignut': null, // Not Common
'Potato': null, // Tons of different names
'Prussian Asparagus': null, // should be covered by asparagus
'Prairie Turnip': null, // should be covered by turnip
'Pumpkin': null, // tons of different names
'Radicchio': null, // italian chicory
'Radish': null, // other names determined to be unimportant
'Ramp': null, // ramps, ramson, wild leek, wood leek, wild garlic
'Rapini': null, // aka broccoli rabe, should be covered
'Red Leaf Lettuce': null, // other names determined to be unimportant
'Ricebean': null, // Not Common
'Runner Bean': null, // another common name is butter bean
'Rutabaga': null, // Swede, swedish turnip, neep
'Salad Savoy': null, // Savoy cabbage
'Salsify': null, // Not Common
'Samphire': null, // Not Common
'Scorzonera': null, // Not Common
'Sculpit': null, // Not Common
'Sea Beet': null, // Not Common
'Sea Grape': null, // Not Common
'Sea Kale': null, // seakale, crambe
'Sea Lettuce': null, // green nori
'Shallot': null, // other names determined to be unimportant
'Sierra Leone Bologi': null, // Not Common
'Skirret': null, // Not Common
'Snap Pea': null, // already covered
'Snow Pea': null, // already covered
'Soko': null, // Not Common
'Sorrel': null, // other names determined to be unimportant
'Sour Cabbage': null, // sauerkraut but this is usually canned, edge case
'Soybean': null, // Usually made into some paste or other product, edge case
'Spinach': null, // Tons of names
'Spring Onion': null, // Scallion, green onion, sibies
'Scallion': null, // already covered
'Squash Blossoms': null, // Not common
'Summer Squash': null, // a general name
'Swede': null, // already covered
'Sweet Potato': null, // sweetpotato
'Taro': null, //kalo, dasheen, godere
'Tarwi': null, // Not Common
'Tatsoi': null, // Not Common
'Tepary Bean': null, // Not Common
'Tigernut': null, // Not Common
'Tomatillo': null, // Mexican husk tomato
'Tomato': null, // Tons of different names
'Tree Onion': null, // Not common
'Turmeric': null, // other names determined to be unimportant
'Turnip': null, // white turnip
'Urad Bean': null, // Not Common
'Ulluco': null, // Not Common
'Wasabi': null, // Japanese horseradish
'Water Chestnut': null, // Chinese water chestnut, edge case because it can be canned
'Water Caltrop': null, // Not Common
'Water Spinach': null, // Not Common
'Watercress': null, // yellowcress
'Welsh Onion': null, // aka spring onion, not sure how important
'Wheatgrass': null, // other names determined to be unimportant
'Wild Leek': null, // Not Common
'Winged Bean': null, // Not Common
'Winter Squash': null, // general name
'Yam': null, // sweet potato
'Yao Choy': null, // Not Common
'Yardlong Bean': null, // Not Common
'Yarrow': null, // Not Common
'Yuca Root': null, // Not Common
'Yukon Gold Potatoes': null, // should be covered by potato already
'Zucchini': null // other names determined to be unimportant
};

//https://en.wikipedia.org/wiki/List_of_culinary_fruits
var fruit_dictionary = {

// website: new pi
// Webscraping:var test = document.getElementsByClassName('fp-item-name');
// Webscraping: Array.from(test).forEach(function(x) {console.log(x.innerText)});
// [x] Organic Yellow Bananas
// [x] Organic Braeburn Apple
// [] New Pi Bakehouse French Baguette
// [x] Organic Lemon
// [/] Organic Pink Lady Apples
// [x] Organic Navel Oranges
// [x] Organic Anjou Pears
// [x] Organic Limes
// [x] Conventional Red Grapes
// [/] Organic Ambrosia Apples
// [x] Organic Minneola Tangelos
// [/] Organic Lady Alice Apples
// [x] Mandarin Cuties Og
// [x] Del Real Dates, Organic, Medjool
// [x] Organic Red Grapefruit
// [x] Organic Kiwi
// [/] Organic Blood Oranges
// [/] Organic 2 LB Bagged Lemons
// [/] Organic Gala Apple 3lb Bag
// [x] Mango Ataulfo
// [/] Organic Mangos
// [/] Lemon Meyer
// [x] Pineapple, Large
// [x] Wonderful Halos Mandarins, 3lb Bag
// [/] White/Green Seedless Grapes
// [/] Buffalo Ridge Apple Chips
// [/] Kiwi
// [x] Plantains
// [/] Cut Fruit Express Mango Spears
// [x] Coconut Date Roll
// [/] Cut Fruit Express Mango Sliced
// [/] Organic Navel Oranges 4 LB Bag
// [/] Apple Granny Smith 3 Lb Bag
// [/] Pineapple
// [x] Cut Fruit Express Cantaloupe Cubes
// [x] New Pi Jackfruit Comm
// [/] Cut Fruit Express Cantaloupe Chunks
// [/] Banana Over Ripe
// [/] Dates Fresh Medjool
// [/] Cut Fruit Express Pineapple Cubes
// [this isnt even a fruit tho] Rolling Hill Rolling Hills Watercress
// [xPapaya Sliced
// [/] Plantains
// [/] Cut Fruit Express Pineapple Chunks
// [/] Apple Opal Organic
// [x] Pomegranate Arils
// [x] Driscolls Sweet Strawberries
// [x] Cut Fruit Express Watermelon Cubes
// [/] White/Green Seedless Grapes
// [/] Cooking/Mexican Papaya/Pawpaw
// [/] Orange Mandarin
// [/] Mexican Papaya
// [/] Cut Fruit Express Watermelon Cubes
// [/] Apple Koru Og
// [/] Cut Fruit Express Watermelon Cubes
// [idk what this is] Tomato Frenzy Og
// [x] Starfruit
// [/] Cut Fruit Express Strawberry/Blueberry/Kiwi Cup
// [/] Apple Braeburn
// [x] Cut Fruit Express Honeydew Cubes
// [/] Apple Pinata
// [/] Organic 3 LB Bag Honeycrisp Apples
// [/] Cut Fruit Express Strawberry Cup
// [/] Native Forest Jackfruit Young
// [these arent fruits tho] Onions Pearl Gold
// [x] Tangerine Murcott
// [/] Cut Fruit Express Pineapple Peeled And Cored
// [/] Cut Fruit Express Mango Kiwi Mix
// [/] Cut Fruit Express Pineapple Cubes
// [/] Grapes Black
// [/] Starfruit
// [/] White Grapefruit, Large
// [/] Cut Fruit Express Pomegranate Seeds
// [/] Cut Fruit Express Grape Mix Red And Green
// [x] Dragon fruit
// [/] Cut Fruit Express Pineapple Cubes
// [x] Cut Fruit Express Melon Cataloupe Grape Mix
// [x] Limequats
// [this is a synonym for lemon] Lemon Meyer
// [/] Grapefruit
// [/] Tangerine
// [/] Cut Fruit Express Watermelon Cubes
// [/] Young Coconut
// [/] Buffalo Ridge Orchard Apples
// [/] Red Grapefruit
// [/] Yellow Bananas
// [/] Fuji Apples, Large
// [/] Braeburn Apples, Large
// [/] Red Bananas
// [/] Coconut Baby
// [/] Coconut Young
// [/] Cut Fruit Express Honeydew Cubes
// [/] Navel Oranges, Small
// [x] Pear Starkrimson
// [/] Organic Cara Cara (Pink) Navel Oranges
// [/] Watermelon Seedless
// [/] Cut Fruit Express Pineapple Red Grape Mix
// [/] Apple Macintosh
// [/] Apple Spartan
// [/] Apple Honeycrisp
// [/] Apple Ginger Gold
// [/] Grapes Concord
// [x] Fresh Prunes
// [x] Clementine / Mandarins
// [/] Blueberries
// [/] Pink Grapefruit, Small
// [already classified in the veggie] Ginger Root
// [/] Kiwi Golden
// [/] Red Mango, Large
// [/] Pink Lady Apples, Large
// [/] Pear Comice
// [/] Apple Autumn Glory
// [/] Lemons, Large
// [/] Red Anjou Pears
// [/] Bosc Pears, Large
// [/] Minneola Tangelo
// [/] Red Raspberries
// [/] Lemons, Small
// [/] Blackberries
// [/] Manderin, Satsuma
// [/] Apple Sciros Organic
// [/] Apple Haralson
// [/] Blueberries
// [/] Tangelo
// [/] Blood Oranges
// [/] Melon Orange Cantaline
// [x] kumquat
// [x] papaya
// [x] dragon fruit
// [x] meyer lemon vs lemon
// [x] blood orange
// [x] kiwi
// [x] pomelo? type of grapefruit
// [x] jackfruit
// [x] fig, edgecase because can be dried or fresh
// [x] polmegranate
// [x] apricots
// [x] plumcots
// [x] plums
// [x] leches
// [x] passion fruit
// [x] star fruit
// [x] plantains
// [x] persimmon
// [x] cantelope = musk melon
} 

// This list can probably be fairly small
// It gets tricky when the cut of meat is used instead

var meat_dictionary = {
// Generic words: Rib, Chop, Loin
// [x] Beef
// [x] chuck
// [x] ribeye
// [hold off] stew meat -> trained on meat instead
// [x] short rib - > trained on rib instead
// [x] brisket
// [x] new york strip, strip -> trained on strip instead
// [x] flat iron
// [x] tri-tip
// [x] flank steak -> trained on steak instead
// [x] top sirloin -> trained on sirloin
// [x] beef tenderloin
// [/] rib eye steak - > should be a synonym
// [/] top round steak
// [x] chuck pot roast -> trained on roast instead
// [x] Chicken, chicken wings
// [x] Roast, Chuck roast, rump roast -> trained on rump
// [] Steak, be careful of situations with ham steak
// [x] Bacon
// [x] Turkey
// [x] Ham, pork, chorizo, sausage? but could be beef also, butt roast, kielbasa, babby back ribs
// [x] Bratwurst, brawt, brat
// [x] Hotdog, hot dog
// [x] Lamb, lamb shoulder roast, rack of lamb
// [x] pepperoni, salami, salame, andoulle, Braunschweiger
// [x] corned beef
// [x] Pancetta, prosciutto
// [x] weiners
// [x] Duck
// [x] Roast beef
// [x] meat balls
// [should probably untrain this]veggie burgers is a frozen item
// [x] liver
// [x] kidney
// [x] bison
}

var refrigerated_dictionary = {
// Butter
// Margarine
// Cheese
// Mozzarella
// cheddar
// feta
// [not sure i should train this]mexican blend
// parmesan
// reggiano
// gouda
// pepper jack
// colby jack
// muenster
// monterey jack
// brie
// Pecorino Romano
// burrata
// queso
// havarti
// fontina
// gruyere
// swiss
// gorgonzola
// asiago
// Provolone  
// [not sure i should train this] Blue
// [/] Cottage Cheese
// Cream
// Creamer
// Eggnog, Nog
// [/] Sour Cream
// Milk
// Yogurt
// Eggs
// Tofu
// Juice --> could be in dry good?
// Lemonade
// Water --> could be in dry good?
// Half & Half
// [x] Pudding
}

// dictionary for seafood?
var seafood_dictionary = {
 // [x] Salmon
 // [x] Shrimp
 // [x] Scallops
 // [x] Oysters
 // [x] Clams
 // [x] muscles
 // [x] Crab
 // [x] Lobster
 // [x] Prawn
 // [x] Herring
 // [x] Trout
 // [x] Fish
 // [x] Tilapia
 // [x] Catfish
 // [x] Red Snapper --> snapper
 // [x] Halibut
 // [x] sword fish
 // [x] Cod
}

// frozen goods may be indicated by the use of "frozen" in product text
var frozen_dictionary = {
 // Frozen
 // Pie Crust
 // Pastry Dough
 // Custard
 // Gelato
 // Ice Cream
 // Ice Cream Cones
 // Popsicles
 // Sorbet
 // Sherbet
 // Tamale
 // bag -> can this be applied to frozen foods or dry foods?
}

// canned/dry goods may be indicated by the measurement or if it doesnt fit in the other categories
// dry goods & etc
var dry_good_and_etc_dictionary = {
  // This will most likely be ect
}