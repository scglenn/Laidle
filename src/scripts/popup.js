/*

    File: Popup.js
    Purpose: 

      [] - This is the designated javascript for the popup view.

      [] - This gives the user the ability to select the grocery list or view/add/edit/delete recipes

*/

import {fadeOutDownAnimation,initializeAnimation } from './page_transitions.js';

// Grab the html page that was loaded last
// This functionality helps retain the users last actions
chrome.storage.sync.get('page_on_load', function(data) {
  
  var page = data.page_on_load;

  // ingredients.html
  // What needs to be saved?
  // - html page file to load on click
  // - Ingredient strings
  if(page.includes("ingredients.html"))
  {
    window.location.href="../views/ingredients.html";
  }

  // recipe_list.html
  // What needs to be saved?
  // - html page file to load on click
  // - probably nothing special, just reload everything
  if(page.includes("recipe_list.html"))
  {
    window.location.href="../views/recipe_list.html";
  }

  // recipe.html
  // What needs to be saved?
  // - html page file to load on click
  // - recipe title
  // - recipe description
  if(page.includes("recipe.html"))
  {
    window.location.href=page;
  }

});

// Both buttons that give the user the ability to generate grocery list and the recipes page
var show_ingredients_btn = document.getElementById('showIngredients');
var show_recipes_btn = document.getElementById('showRecipes');

// Transition extension page to ingredients view
show_ingredients_btn.onclick = function(element) {

  fadeOutDownAnimation("../views/ingredients.html");
};

// Transition extension page to the recipe list view
show_recipes_btn.onclick = function(element) {

  fadeOutDownAnimation("../views/recipe_list.html")
};

// Start animations on page load
initializeAnimation();

