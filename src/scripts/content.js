const selectors = `
  .tasty-recipes,
  .ERSPrintBtn,
  [title="Print Recipe"],
  .wprm-recipe,
  .print-recipe,
  .simple-recipe-pro,
  [itemtype*="schema.org/Recipe"],
  .easyrecipe,
  .wpurp-container,
  section.zip-recipes,
  .cooked-recipe-info,
  .boorecipe-recipe,
  .ingredients-section
`

const targets = document.querySelectorAll(selectors)

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.doSkip) {
    try {
      targets[0].scrollIntoView()
      targets[0].focus()
      //chrome.extension.getBackgroundPage().console.log(targets[0])
      var new_targets = targets[0].querySelectorAll(".ingredients-item-name");
      var the_text ="";
      let recipe_text = document.getElementById('recipe');
      new_targets.forEach(function(element) {
        the_text += element.textContent;
      });
      console.log(the_text);

      chrome.runtime.sendMessage({food_list: the_text}, function(response) {
        console.log(response);
      });
      
    } catch (err) { return }
  } else if (req.skipCheck) sendResponse({ 'skip': targets && targets[0] })
  return true
})