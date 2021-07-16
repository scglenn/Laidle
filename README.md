<p align="center">
  <img src="/resources/readme.gif" alt="Usage Video">
</p>

# 🥄  Laidle 🤖 

Laidle is a Chrome extension that generates a comprehensive grocery list from recipes collected in browser! 
Artificial intelligence is used to parse the ingredients of each recipe into a clean list that is easy to shop with!

# 💡 Background 💡

Eating home cooked meals every day can require a lot of planning if you are trying to get everything in a single trip to the store. 

<p align="center">
  <img src="/resources/meme.gif" alt="Meme">
</p>

I usually find 5 recipes online and proceed write up a grocery list that doesnt have duplicate items. By the time im finished, I have a messy list with multiple things crossed off and not to mention all the time it took to scan through each recipe. So I decided to create this chrome extension do to all that for me. I figured it would save me time and the headache of it all. 

After a couple hours I realized that I hated the idea of writing logic for parsing ingredient text. So I figured I could train Wit.ai to do it for me! Thus Laidle was born!

## Potential Future Updates

1. Saving website URL to an associated recipe
2. Functionality for sending an email/notification to the user with the generated list.
3. Grocery list output gets upgrade UI
4. Some way of calculating calories
5. Functionality to search/filter the recipe list saved to the users extension
6. Functionality for sharing grocery list with someone else
7. Adding new recipes gets upgraded UI. (allowing user to see the saved data is recognized and can be modified instead of a text area format)
8. Functionality to recognize how to convert multiple measurements under a product into 1 measurement size (3 tsp = 1 tbs)
9. Web previews of the recipe from the URL it was copied from
10. Implement strategy to couple ingredients together better and put similiar named products next to eachother in the grocery list
11. New Loading Gif for generating the grocery list

## Laidle Version 1.0 Roadmap

1. Train Laidle on the most common food/recipe websites (The 20 most popular or so)
	- Test 10 recipes per site
	- Record error rate
2. Make updates to Wit.ai and chrome extension software based on data collected from training
3. Give Buy Me A Coffee members early access
4. Make available on the chrome store

## Repository Installation

### Chrome
1. Click the "Clone or Download" dropdown above and then "Download ZIP".
2. Move the `Laidle-main` folder from the ZIP to wherever you'd like.
3. Type `chrome://extensions/` in your address bar.
4. Check "Developer Mode" at the top right of the page.
5. Click "Load Unpacked" on the top left and open the `Laidle-main` folder.

## Have a suggestion for a recipe website I've missed?

[Create an issue!](https://github.com/scglenn/laidle/issues/new)
