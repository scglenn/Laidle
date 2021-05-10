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

// List of category objects
// a) Text area displays the ingredients 
// b) Div element surrounding the section
// c) Key to get/set category in memory
var category_sections = {
  vegetable: {
    text_area_element: document.getElementById('vegetable'),
    div_element: document.getElementById('veggie_div'),
    storage_string: 'vegetable_list'
  },
  fruit: {
    text_area_element: document.getElementById('fruit'),
    div_element: document.getElementById('fruit_div'),
    storage_string: 'fruit_list'
  },
  meat: {
    text_area_element: document.getElementById('meat'),
    div_element: document.getElementById('meat_div'),
    storage_string: 'meat_list'
  },
  fridge: {
    text_area_element: document.getElementById('fridge'),
    div_element: document.getElementById('fridge_div'),
    storage_string: 'fridge_list'
  },
  seafood: {
    text_area_element: document.getElementById('seafood'),
    div_element: document.getElementById('seafood_div'),
    storage_string: 'seafood_list'
  },
  freezer: {
    text_area_element: document.getElementById('freezer'),
    div_element: document.getElementById('freezer_div'),
    storage_string: 'freezer_list'
  },
  dry_goods : {
    text_area_element: document.getElementById('dry goods'),
    div_element: document.getElementById('dry_goods_div'),
    storage_string: 'dry_list'
  },
  etc: {
    text_area_element: document.getElementById('etc'),
    div_element: document.getElementById('etc_div'),
    storage_string: 'etc_list'
  }
}

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
  var product = "Unknown Product";

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

  var current_entities_category =  "etc";
  
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
      let product_entities = res.entities[key][0].entities;

      if(product_entities[0] != null)
      {
        let entity_name =  "";

        let same_categories = true;

        // Example: Persian cucumbers, arugula, tomatoes, and basil, for serving
        // This example case has notes and veggies in it
        // Other Examples: 2 tablespoons apple cider vinegar
        product_entities.forEach(function(product_entity)
        {
          if(product_entity.name != "note")
          {
            // Todo: Make a dictionary of the entities instead of having a large if else structure
            // Todo: Strategy should be created to determine how to categorize multiple entities under one product
            if(product_entity.name != entity_name && entity_name != "")
            {
              same_categories = false;
            }
            else if( product_entity.name == "vegetable")
            {
              entity_name = product_entity.name; 
            }
            else if (product_entity.name == "fruit")
            {
              entity_name = product_entity.name; 
            }
            else if(product_entity.name == "meat")
            {
              entity_name = product_entity.name; 
            }
            else if (product_entity.name == "fridge")
            {
              entity_name = product_entity.name; 
            }
            else if (product_entity.name == "seafood")
            {
              entity_name = product_entity.name; 
            }
            else if (product_entity.name == "Freezer")
            {
              entity_name = product_entity.name; 
            }
            else
            {
              entity_name = "etc";
            }
          }
        });

        // This case will categorize a product into the "etc" category if it has multiple sub-entities of different categories
        // For now this is a bandaid until a more sophisticated strategy is developed to handle this edge case
        if(same_categories == false)
        {
          current_entities_category = "etc";
        }
        else
        {
          current_entities_category = entity_name;
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
    else if(entity_name == "wit$number" || entity_name == "amount")
    {
      //  Note:
      //  This case catches any other entities. Mostly just wit$number and amount. Only numbers for now.
      amount_found = true;
      amount = entity_value;
    }
    else
    {
      // Items that fall into that case would be if a vegetable,fruit,meat, etc has been found by wit but not under a "product"
      // To Do: Strategy needs to be developed for how cases like these will be handled
    }
  });

  //Debugging purposes: 
  //  Output WIT.ai results.
  console.log(res.entities);

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

// Writes the ingredient list to the text area
async function fillList()
{

  // Iterate through the dictionary of recipe information    
  Object.keys(dict).forEach(function(key) 
  {

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
 
        current_text_area.value += key + "\n";
        current_text_area.value += "• " + second_key + "\n";
        // Move on to the next ingredient
        current_text_area.value += "\n";
        
        current_text_area.style.height = "0px";

      });
    }
    else
    {

      //4 English (seedless) cucumbers, thinly sliced
      // has no product, how to protect against these cases?

      console.log(dict[key]);
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

    current_text_area.style.height = "0px";
  });
};

chrome.storage.sync.get('retain_grocery_list' , function(data) 
{
  if(data.retain_grocery_list == true)
  {
    Object.keys(category_sections).forEach(category=> 
    {
      // Not sure if storage_string needs []
      chrome.storage.sync.get(category_sections[category].storage_string, function(list_data){
        category_sections[category].text_area_element.style.height = "0px";
        category_sections[category].text_area_element.value = list_data[Object.keys(list_data)[0]];
        category_sections[category].text_area_element.style.height = category_sections[category].text_area_element.scrollHeight + 10 + "px";
        if(category_sections[category].text_area_element.value == "")
        {
          category_sections[category].div_element.remove();
        }
      });
    });
   
    transitionLoadingAnimation();
  }
  else
  {
    executeGroceryListGeneration();
  }
});

async function executeGroceryListGeneration()
{
  // Start process for making fetch requests to WIT API and parsing data into the ingredient text area
  awaitForRecipeIDList().then(data=>
  {
    // The list of all recipes
    var recipe_list = data;

    // Pull recipe list and start the process of making WIT API requests
    awaitForRecipeList(recipe_list).then(data=>
    {
      var recipePromises =[];
    
      // Iterate through each recipe 
      Object.keys(data).forEach(key => 
      {
        if(data[key].recipe_is_included)
        {
          // Parse each ingredient by the return character
          var each_ingredient = data[key].recipe_description.split('\n');

          // Execute fetch requests to WIT API for each ingredient in each recipe
          recipePromises.push(awaitForWITReponse(each_ingredient));
        }
      });
      
      Promise.all(recipePromises).then(function (responses) 
      {
        // Get a JSON object from each of the responses
        return Promise.all(responses.map(function (response) { 
          return response;
        }));
      })
      .then(()=>{

        fillList();
        
        Object.keys(category_sections).forEach(category=> 
        {
          if(category_sections[category].text_area_element.value == "")
          {
            category_sections[category].div_element.remove();
          }
          else
          {
            category_sections[category].text_area_element.style.height = category_sections[category].text_area_element.scrollHeight + 10 + "px";
          }

          chrome.storage.sync.set({[category_sections[category].storage_string]: category_sections[category].text_area_element.value}, function(){});
          
        });
  
        chrome.storage.sync.set({retain_grocery_list: true}, function(){});

        transitionLoadingAnimation();

        }
      );
    });
  });

  
};

function transitionLoadingAnimation()
{
    // Make menu visible
    document.getElementById('mainMenu').style.visibility = "visible";

    // Make loading div hidden
    document.getElementById('loading-wrapper').style.visibility = "hidden";

    // Once text area has data written to it, allow the page to fade in and hide the loading gif
    fadeInUpAnimation();
}

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
      // Resolve the promise and return dict
      resolve(dict);
    })
    .catch(function (error) 
    {
      // if there's an error, log it
      console.log(error);
    });    
  });
}