(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

//  Customer enters their required search parameters (ingredients, course type, cusisine type, dietary restrictions)
//  Example of a search for chicken and broccoli / Main dish / Italian / No dietary restriction
//  Do an API call for all recipes with chicken and broccoli
//  Then filter the results based on the other criteria - starting with course type - then cuisine type - then dietary restrcitions
//  The data is pulled from the API and displayed onto the page in a list
//  The filtered results will then be broken down into individual recipes - displaying an image of the dish, the name of the dish and a  description of it
//  need to store recipe id from each filtered result and do a separate pull to get the info from there
//  The recipes will be clickable to take them to a full view of them
//  The recipes will be opened in a new tab

//  namespace for the project
var foodApp = {};

foodApp.apiID = '?_app_id=29d4e9cb';
foodApp.apiKey = '&_app_key=3d9fe704063a8a69bdc768b960f23f6e';
foodApp.allRecipiesApiURL = 'http://api.yummly.com/v1/api/recipes' + foodApp.apiID;
foodApp.singleRecipeApiURL = 'http://api.yummly.com/v1/api/recipe/';
foodApp.totalResultCount = 0;

//  the getAllRecipes method takes in the parameters from the search form and gets the matching data from the API. The results are then stored in the storedResults array
foodApp.getAllRecipes = function (ingredients, courseType, cuisineType, dietary) {
    $.ajax({
        url: '' + foodApp.allRecipiesApiURL + foodApp.apiKey + courseType + cuisineType + dietary,
        method: 'GET',
        dataType: 'json',
        data: {
            q: ingredients,
            requirePictures: true,
            maxResult: 504,
            start: foodApp.recipePages
        }
    }).then(function (result) {
        foodApp.storedResults = [];
        foodApp.pagedResults = [];
        foodApp.recipePages = 0;
        result.matches.forEach(function (res) {
            foodApp.storedResults.push(res);
        });
        foodApp.totalResultCount = result.totalMatchCount;
        foodApp.splitRecipes();
        foodApp.displayRecipes(foodApp.pagedResults[foodApp.recipePages]);
    });
};

//  the splitRecipes method splits the intially stored results into an array of results pages, with 21 entries on each
foodApp.splitRecipes = function () {
    for (var i = 0; i < foodApp.storedResults.length; i += 21) {
        var block = foodApp.storedResults.slice(i, i + 21);
        foodApp.pagedResults.push(block);
    }
};

//  the displayRecipes method takes the recipes and breaks them down to be displayed on screen
foodApp.displayRecipes = function (recipes) {
    //  clear the results from the page as well as any displaying buttons
    $('.recipe-list').empty();
    $('.page-results-container').empty();
    var resultsCount = '<div class="results-count-container">\n    <h3>Recipes Gathered: ' + foodApp.storedResults.length + '</h3>\n    </div>';
    $('.recipe-list').append(resultsCount);
    //  loop through the array for the current page and grab the individual recipes info
    recipes.forEach(function (item) {
        foodApp.getSingleRecipe(item.id);
    });
    //  only show the show previous button if there are results to go back to
    if (foodApp.recipePages > 0) {
        var showPreviousButton = '<button class="show-previous show-button">Show Previous Results</button>';
        $('.page-results-container').append(showPreviousButton);
    }
    //  only show the show more button if there are still more results to show
    if (foodApp.recipePages <= foodApp.pagedResults.length - 2) {
        var showMoreButton = '<button class="show-more show-button">Show More Results</button>';
        $('.page-results-container').append(showMoreButton);
    }
};

//  the rating method converts the numerical rating (if present) and displays stars in its place
foodApp.rating = function (ratingNum) {
    var tempRating = '';
    if (ratingNum) {
        for (var i = 1; i <= ratingNum; i++) {
            tempRating += '<span class="star"><i class="fas fa-star"></i></span>';
        }
    }
    return tempRating;
};

//  the getSingleRecipe method takes in a recipeID and pulls the info for that specific recipe
foodApp.getSingleRecipe = function (recipeID) {
    $.ajax({
        url: '' + foodApp.singleRecipeApiURL + recipeID + foodApp.apiID + foodApp.apiKey,
        method: 'GET',
        dataType: 'json'
    }).then(function (result) {
        //  format the returned courses and cuisine attributes for the page
        var courses = "---";
        if (result.attributes.course) {
            courses = result.attributes.course.join(', ');
        }
        var cuisines = "---";
        if (result.attributes.cuisine) {
            cuisines = result.attributes.cuisine.join(', ');
        }
        var rating = foodApp.rating(result.rating);
        console.log(rating);
        //  create the HTML elements to write the recipe to the DOM and append it to the recipe-list div
        var showRecipe = '<a href="' + result.source.sourceRecipeUrl + '" target="top"><div class="recipe-container">\n        <div class="img-container"><img src=\'' + result.images[0].hostedLargeUrl + '\'></div>\n        <h2>' + result.name + '</h2>\n        <h3>Rating: ' + rating + '</h3>\n        <h3>Total Time to Prepare: ' + result.totalTime + '</h3>\n        <h3>Number of Servings: ' + result.numberOfServings + '</h3>\n        <h3>Course Types: ' + courses + '</h3>\n        <h3>Cuisine Types: ' + cuisines + '</h3>\n        \n        </div><div class="recipe-overlay"><h3>Click here to read the full recipe</h3></div></a>';
        $('.recipe-list').append(showRecipe);
    });
};

//  the events method will hold general event listeners for the site
foodApp.events = function () {
    $('.initial-search').on('submit', function (e) {
        e.preventDefault();
        var ingredients = $('.initial-search-box').val();
        $('.main-welcome-page').hide();
        $('nav').show();
        $('.recipe-search-box').val($('.initial-search-box').val());
        foodApp.getAllRecipes(ingredients, '', '', '');
    });
    $('.recipe-search').on('submit', function (e) {
        e.preventDefault();
        //  store the results from the form to be used later for pagination
        var ingredients = $('.recipe-search-box').val();
        console.log(ingredients);
        var courses = $('input[name=course-type]:checked').val();
        var cuisines = $('input[name=cuisine-type]:checked').map(function () {
            return $(this).val();
        }).get().join('');
        var dietary = $('input[name=dietary-restrictions]:checked').val();
        //  send the search results to the getAllRecipes method to pull the data from the API
        foodApp.getAllRecipes(ingredients, courses, cuisines, dietary);
    });
    //  event listener to clear the search form
    $('.form-reset').on('click', function () {
        $('.recipe-search').trigger('reset');
    });
    //  event listener for the show previous button to show previous recipe results
    $('body').on('click', '.show-previous', function () {
        foodApp.recipePages--;
        foodApp.displayRecipes(foodApp.pagedResults[foodApp.recipePages]);
    });
    //  event listener for the show more button to show more recipe results
    $('body').on('click', '.show-more', function () {
        foodApp.recipePages++;
        foodApp.displayRecipes(foodApp.pagedResults[foodApp.recipePages]);
    });
};

//  the init method initializes all the necessary methods when the page loads
foodApp.init = function () {
    $('.recipe-search').trigger('reset');
    $('.initial-search').trigger('reset');
    foodApp.events();
};

//  document.ready to call the init method once the page is finished loading
$(function () {
    foodApp.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFNLFVBQVUsRUFBaEI7O0FBRUEsUUFBUSxLQUFSLEdBQWdCLG1CQUFoQjtBQUNBLFFBQVEsTUFBUixHQUFpQiw0Q0FBakI7QUFDQSxRQUFRLGlCQUFSLDRDQUFtRSxRQUFRLEtBQTNFO0FBQ0EsUUFBUSxrQkFBUixHQUE2QixzQ0FBN0I7QUFDQSxRQUFRLGdCQUFSLEdBQTJCLENBQTNCOztBQUVBO0FBQ0EsUUFBUSxhQUFSLEdBQXdCLFVBQUMsV0FBRCxFQUFjLFVBQWQsRUFBMEIsV0FBMUIsRUFBdUMsT0FBdkMsRUFBbUQ7QUFDdkUsTUFBRSxJQUFGLENBQU87QUFDSCxrQkFBUSxRQUFRLGlCQUFoQixHQUFvQyxRQUFRLE1BQTVDLEdBQXFELFVBQXJELEdBQWtFLFdBQWxFLEdBQWdGLE9BRDdFO0FBRUgsZ0JBQVEsS0FGTDtBQUdILGtCQUFVLE1BSFA7QUFJSCxjQUFNO0FBQ0YsZUFBRyxXQUREO0FBRUYsNkJBQWlCLElBRmY7QUFHRix1QkFBVyxHQUhUO0FBSUYsbUJBQU8sUUFBUTtBQUpiO0FBSkgsS0FBUCxFQVdLLElBWEwsQ0FXVSxVQUFDLE1BQUQsRUFBWTtBQUNkLGdCQUFRLGFBQVIsR0FBd0IsRUFBeEI7QUFDQSxnQkFBUSxZQUFSLEdBQXVCLEVBQXZCO0FBQ0EsZ0JBQVEsV0FBUixHQUFzQixDQUF0QjtBQUNBLGVBQU8sT0FBUCxDQUFlLE9BQWYsQ0FBdUIsVUFBQyxHQUFELEVBQVM7QUFDNUIsb0JBQVEsYUFBUixDQUFzQixJQUF0QixDQUEyQixHQUEzQjtBQUNILFNBRkQ7QUFHQSxnQkFBUSxnQkFBUixHQUEyQixPQUFPLGVBQWxDO0FBQ0EsZ0JBQVEsWUFBUjtBQUNBLGdC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QUUsTUFBRixFQUFVLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLGdCQUF0QixFQUF3QyxZQUFZO0FBQ2hELGdCQUFRLFdBQVI7QUFDQSxnQkFBUSxjQUFSLENBQXVCLFFBQVEsWUFBUixDQUFxQixRQUFRLFdBQTdCLENBQXZCO0FBQ0gsS0FIRDtBQUlBO0FBQ0EsTUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IsWUFBdEIsRUFBb0MsWUFBWTtBQUM1QyxnQkFBUSxXQUFSO0FBQ0EsZ0JBQVEsY0FBUixDQUF1QixRQUFRLFlBQVIsQ0FBcUIsUUFBUSxXQUE3QixDQUF2QjtBQUNILEtBSEQ7QUFJSCxDQXBDRDs7QUFzQ0E7QUFDQSxRQUFRLElBQVIsR0FBZSxZQUFNO0FBQ2pCLE1BQUUsZ0JBQUYsRUFBb0IsT0FBcEIsQ0FBNEIsT0FBNUI7QUFDQSxNQUFFLGlCQUFGLEVBQXFCLE9BQXJCLENBQTZCLE9BQTdCO0FBQ0EsWUFBUSxNQUFSO0FBQ0gsQ0FKRDs7QUFNQTtBQUNBLEVBQUUsWUFBWTtBQUNWLFlBQVEsSUFBUjtBQUNILENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyAgQ3VzdG9tZXIgZW50ZXJzIHRoZWlyIHJlcXVpcmVkIHNlYXJjaCBwYXJhbWV0ZXJzIChpbmdyZWRpZW50cywgY291cnNlIHR5cGUsIGN1c2lzaW5lIHR5cGUsIGRpZXRhcnkgcmVzdHJpY3Rpb25zKVxuLy8gIEV4YW1wbGUgb2YgYSBzZWFyY2ggZm9yIGNoaWNrZW4gYW5kIGJyb2Njb2xpIC8gTWFpbiBkaXNoIC8gSXRhbGlhbiAvIE5vIGRpZXRhcnkgcmVzdHJpY3Rpb25cbi8vICBEbyBhbiBBUEkgY2FsbCBmb3IgYWxsIHJlY2lwZXMgd2l0aCBjaGlja2VuIGFuZCBicm9jY29saVxuLy8gIFRoZW4gZmlsdGVyIHRoZSByZXN1bHRzIGJhc2VkIG9uIHRoZSBvdGhlciBjcml0ZXJpYSAtIHN0YXJ0aW5nIHdpdGggY291cnNlIHR5cGUgLSB0aGVuIGN1aXNpbmUgdHlwZSAtIHRoZW4gZGlldGFyeSByZXN0cmNpdGlvbnNcbi8vICBUaGUgZGF0YSBpcyBwdWxsZWQgZnJvbSB0aGUgQVBJIGFuZCBkaXNwbGF5ZWQgb250byB0aGUgcGFnZSBpbiBhIGxpc3Rcbi8vICBUaGUgZmlsdGVyZWQgcmVzdWx0cyB3aWxsIHRoZW4gYmUgYnJva2VuIGRvd24gaW50byBpbmRpdmlkdWFsIHJlY2lwZXMgLSBkaXNwbGF5aW5nIGFuIGltYWdlIG9mIHRoZSBkaXNoLCB0aGUgbmFtZSBvZiB0aGUgZGlzaCBhbmQgYSAgZGVzY3JpcHRpb24gb2YgaXRcbi8vICBuZWVkIHRvIHN0b3JlIHJlY2lwZSBpZCBmcm9tIGVhY2ggZmlsdGVyZWQgcmVzdWx0IGFuZCBkbyBhIHNlcGFyYXRlIHB1bGwgdG8gZ2V0IHRoZSBpbmZvIGZyb20gdGhlcmVcbi8vICBUaGUgcmVjaXBlcyB3aWxsIGJlIGNsaWNrYWJsZSB0byB0YWtlIHRoZW0gdG8gYSBmdWxsIHZpZXcgb2YgdGhlbVxuLy8gIFRoZSByZWNpcGVzIHdpbGwgYmUgb3BlbmVkIGluIGEgbmV3IHRhYlxuXG4vLyAgbmFtZXNwYWNlIGZvciB0aGUgcHJvamVjdFxuY29uc3QgZm9vZEFwcCA9IHt9O1xuXG5mb29kQXBwLmFwaUlEID0gJz9fYXBwX2lkPTI5ZDRlOWNiJ1xuZm9vZEFwcC5hcGlLZXkgPSAnJl9hcHBfa2V5PTNkOWZlNzA0MDYzYThhNjliZGM3NjhiOTYwZjIzZjZlJztcbmZvb2RBcHAuYWxsUmVjaXBpZXNBcGlVUkwgPSBgaHR0cDovL2FwaS55dW1tbHkuY29tL3YxL2FwaS9yZWNpcGVzJHtmb29kQXBwLmFwaUlEfWA7XG5mb29kQXBwLnNpbmdsZVJlY2lwZUFwaVVSTCA9ICdodHRwOi8vYXBpLnl1bW1seS5jb20vdjEvYXBpL3JlY2lwZS8nO1xuZm9vZEFwcC50b3RhbFJlc3VsdENvdW50ID0gMDtcblxuLy8gIHRoZSBnZXRBbGxSZWNpcGVzIG1ldGhvZCB0YWtlcyBpbiB0aGUgcGFyYW1ldGVycyBmcm9tIHRoZSBzZWFyY2ggZm9ybSBhbmQgZ2V0cyB0aGUgbWF0Y2hpbmcgZGF0YSBmcm9tIHRoZSBBUEkuIFRoZSByZXN1bHRzIGFyZSB0aGVuIHN0b3JlZCBpbiB0aGUgc3RvcmVkUmVzdWx0cyBhcnJheVxuZm9vZEFwcC5nZXRBbGxSZWNpcGVzID0gKGluZ3JlZGllbnRzLCBjb3Vyc2VUeXBlLCBjdWlzaW5lVHlwZSwgZGlldGFyeSkgPT4ge1xuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogYCR7Zm9vZEFwcC5hbGxSZWNpcGllc0FwaVVSTH0ke2Zvb2RBcHAuYXBpS2V5fSR7Y291cnNlVHlwZX0ke2N1aXNpbmVUeXBlfSR7ZGlldGFyeX1gLFxuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBxOiBpbmdyZWRpZW50cyxcbiAgICAgICAgICAgIHJlcXVpcmVQaWN0dXJlczogdHJ1ZSxcbiAgICAgICAgICAgIG1heFJlc3VsdDogNTA0LFxuICAgICAgICAgICAgc3RhcnQ6IGZvb2RBcHAucmVjaXBlUGFnZXMsXG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBmb29kQXBwLnN0b3JlZFJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvb2RBcHAucGFnZWRSZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb29kQXBwLnJlY2lwZVBhZ2VzID0gMDtcbiAgICAgICAgICAgIHJlc3VsdC5tYXRjaGVzLmZvckVhY2goKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGZvb2RBcHAuc3RvcmVkUmVzdWx0cy5wdXNoKHJlcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvb2RBcHAudG90YWxSZXN1bHRDb3VudCA9IHJlc3VsdC50b3RhbE1hdGNoQ291bnQ7XG4gICAgICAgICAgICBmb29kQXBwLnNwbGl0UmVjaXBlcygpO1xuICAgICAgICAgICAgZm9vZEFwcC5kaXNwbGF5UmVjaXBlcyhmb29kQXBwLnBhZ2VkUmVzdWx0c1tmb29kQXBwLnJlY2lwZVBhZ2VzXSk7XG4gICAgICAgIH0pO1xufVxuXG4vLyAgdGhlIHNwbGl0UmVjaXBlcyBtZXRob2Qgc3BsaXRzIHRoZSBpbnRpYWxseSBzdG9yZWQgcmVzdWx0cyBpbnRvIGFuIGFycmF5IG9mIHJlc3VsdHMgcGFnZXMsIHdpdGggMjEgZW50cmllcyBvbiBlYWNoXG5mb29kQXBwLnNwbGl0UmVjaXBlcyA9ICgpID0+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvb2RBcHAuc3RvcmVkUmVzdWx0cy5sZW5ndGg7IGkgKz0gMjEpIHtcbiAgICAgICAgY29uc3QgYmxvY2sgPSBmb29kQXBwLnN0b3JlZFJlc3VsdHMuc2xpY2UoaSwgaSArIDIxKTtcbiAgICAgICAgZm9vZEFwcC5wYWdlZFJlc3VsdHMucHVzaChibG9jayk7XG4gICAgfVxufVxuXG4vLyAgdGhlIGRpc3BsYXlSZWNpcGVzIG1ldGhvZCB0YWtlcyB0aGUgcmVjaXBlcyBhbmQgYnJlYWtzIHRoZW0gZG93biB0byBiZSBkaXNwbGF5ZWQgb24gc2NyZWVuXG5mb29kQXBwLmRpc3BsYXlSZWNpcGVzID0gKHJlY2lwZXMpID0+IHtcbiAgICAvLyAgY2xlYXIgdGhlIHJlc3VsdHMgZnJvbSB0aGUgcGFnZSBhcyB3ZWxsIGFzIGFueSBkaXNwbGF5aW5nIGJ1dHRvbnNcbiAgICAkKCcucmVjaXBlLWxpc3QnKS5lbXB0eSgpO1xuICAgICQoJy5wYWdlLXJlc3VsdHMtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICBjb25zdCByZXN1bHRzQ291bnQgPSBgPGRpdiBjbGFzcz1cInJlc3VsdHMtY291bnQtY29udGFpbmVyXCI+XG4gICAgPGgzPlJlY2lwZXMgR2F0aGVyZWQ6ICR7Zm9vZEFwcC5zdG9yZWRSZXN1bHRzLmxlbmd0aH08L2gzPlxuICAgIDwvZGl2PmA7XG4gICAgJCgnLnJlY2lwZS1saXN0JykuYXBwZW5kKHJlc3VsdHNDb3VudCk7XG4gICAgLy8gIGxvb3AgdGhyb3VnaCB0aGUgYXJyYXkgZm9yIHRoZSBjdXJyZW50IHBhZ2UgYW5kIGdyYWIgdGhlIGluZGl2aWR1YWwgcmVjaXBlcyBpbmZvXG4gICAgcmVjaXBlcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGZvb2RBcHAuZ2V0U2luZ2xlUmVjaXBlKGl0ZW0uaWQpO1xuICAgIH0pO1xuICAgIC8vICBvbmx5IHNob3cgdGhlIHNob3cgcHJldmlvdXMgYnV0dG9uIGlmIHRoZXJlIGFyZSByZXN1bHRzIHRvIGdvIGJhY2sgdG9cbiAgICBpZiAoZm9vZEFwcC5yZWNpcGVQYWdlcyA+IDApIHtcbiAgICAgICAgY29uc3Qgc2hvd1ByZXZpb3VzQnV0dG9uID0gYDxidXR0b24gY2xhc3M9XCJzaG93LXByZXZpb3VzIHNob3ctYnV0dG9uXCI+U2hvdyBQcmV2aW91cyBSZXN1bHRzPC9idXR0b24+YDtcbiAgICAgICAgJCgnLnBhZ2UtcmVzdWx0cy1jb250YWluZXInKS5hcHBlbmQoc2hvd1ByZXZpb3VzQnV0dG9uKTtcbiAgICB9XG4gICAgLy8gIG9ubHkgc2hvdyB0aGUgc2hvdyBtb3JlIGJ1dHRvbiBpZiB0aGVyZSBhcmUgc3RpbGwgbW9yZSByZXN1bHRzIHRvIHNob3dcbiAgICBpZiAoZm9vZEFwcC5yZWNpcGVQYWdlcyA8PSAoKGZvb2RBcHAucGFnZWRSZXN1bHRzLmxlbmd0aCkgLSAyKSkge1xuICAgICAgICBjb25zdCBzaG93TW9yZUJ1dHRvbiA9IGA8YnV0dG9uIGNsYXNzPVwic2hvdy1tb3JlIHNob3ctYnV0dG9uXCI+U2hvdyBNb3JlIFJlc3VsdHM8L2J1dHRvbj5gO1xuICAgICAgICAkKCcucGFnZS1yZXN1bHRzLWNvbnRhaW5lcicpLmFwcGVuZChzaG93TW9yZUJ1dHRvbik7XG4gICAgfVxufVxuXG4vLyAgdGhlIHJhdGluZyBtZXRob2QgY29udmVydHMgdGhlIG51bWVyaWNhbCByYXRpbmcgKGlmIHByZXNlbnQpIGFuZCBkaXNwbGF5cyBzdGFycyBpbiBpdHMgcGxhY2VcbmZvb2RBcHAucmF0aW5nID0gKHJhdGluZ051bSkgPT4ge1xuICAgIGxldCB0ZW1wUmF0aW5nID0gJyc7XG4gICAgaWYgKHJhdGluZ051bSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSByYXRpbmdOdW07IGkrKykge1xuICAgICAgICAgICAgdGVtcFJhdGluZyArPSBgPHNwYW4gY2xhc3M9XCJzdGFyXCI+PGkgY2xhc3M9XCJmYXMgZmEtc3RhclwiPjwvaT48L3NwYW4+YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGVtcFJhdGluZztcbn1cblxuLy8gIHRoZSBnZXRTaW5nbGVSZWNpcGUgbWV0aG9kIHRha2VzIGluIGEgcmVjaXBlSUQgYW5kIHB1bGxzIHRoZSBpbmZvIGZvciB0aGF0IHNwZWNpZmljIHJlY2lwZVxuZm9vZEFwcC5nZXRTaW5nbGVSZWNpcGUgPSAocmVjaXBlSUQpID0+IHtcbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IGAke2Zvb2RBcHAuc2luZ2xlUmVjaXBlQXBpVVJMfSR7cmVjaXBlSUR9JHtmb29kQXBwLmFwaUlEfSR7Zm9vZEFwcC5hcGlLZXl9YCxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICB9KVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAvLyAgZm9ybWF0IHRoZSByZXR1cm5lZCBjb3Vyc2VzIGFuZCBjdWlzaW5lIGF0dHJpYnV0ZXMgZm9yIHRoZSBwYWdlXG4gICAgICAgICAgICBsZXQgY291cnNlcyA9IFwiLS0tXCI7XG4gICAgICAgICAgICBpZiAocmVzdWx0LmF0dHJpYnV0ZXMuY291cnNlKSB7XG4gICAgICAgICAgICAgICAgY291cnNlcyA9IHJlc3VsdC5hdHRyaWJ1dGVzLmNvdXJzZS5qb2luKCcsICcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgY3Vpc2luZXMgPSBcIi0tLVwiO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5hdHRyaWJ1dGVzLmN1aXNpbmUpIHtcbiAgICAgICAgICAgICAgICBjdWlzaW5lcyA9IHJlc3VsdC5hdHRyaWJ1dGVzLmN1aXNpbmUuam9pbignLCAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJhdGluZyA9IGZvb2RBcHAucmF0aW5nKHJlc3VsdC5yYXRpbmcpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmF0aW5nKTtcbiAgICAgICAgICAgIC8vICBjcmVhdGUgdGhlIEhUTUwgZWxlbWVudHMgdG8gd3JpdGUgdGhlIHJlY2lwZSB0byB0aGUgRE9NIGFuZCBhcHBlbmQgaXQgdG8gdGhlIHJlY2lwZS1saXN0IGRpdlxuICAgICAgICAgICAgY29uc3Qgc2hvd1JlY2lwZSA9IGA8YSBocmVmPVwiJHtyZXN1bHQuc291cmNlLnNvdXJjZVJlY2lwZVVybH1cIiB0YXJnZXQ9XCJ0b3BcIj48ZGl2IGNsYXNzPVwicmVjaXBlLWNvbnRhaW5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW1nLWNvbnRhaW5lclwiPjxpbWcgc3JjPScke3Jlc3VsdC5pbWFnZXNbMF0uaG9zdGVkTGFyZ2VVcmx9Jz48L2Rpdj5cbiAgICAgICAgPGgyPiR7cmVzdWx0Lm5hbWV9PC9oMj5cbiAgICAgICAgPGgzPlJhdGluZzogJHtyYXRpbmd9PC9oMz5cbiAgICAgICAgPGgzPlRvdGFsIFRpbWUgdG8gUHJlcGFyZTogJHtyZXN1bHQudG90YWxUaW1lfTwvaDM+XG4gICAgICAgIDxoMz5OdW1iZXIgb2YgU2VydmluZ3M6ICR7cmVzdWx0Lm51bWJlck9mU2VydmluZ3N9PC9oMz5cbiAgICAgICAgPGgzPkNvdXJzZSBUeXBlczogJHtjb3Vyc2VzfTwvaDM+XG4gICAgICAgIDxoMz5DdWlzaW5lIFR5cGVzOiAke2N1aXNpbmVzfTwvaDM+XG4gICAgICAgIFxuICAgICAgICA8L2Rpdj48ZGl2IGNsYXNzPVwicmVjaXBlLW92ZXJsYXlcIj48aDM+Q2xpY2sgaGVyZSB0byByZWFkIHRoZSBmdWxsIHJlY2lwZTwvaDM+PC9kaXY+PC9hPmBcbiAgICAgICAgICAgICQoJy5yZWNpcGUtbGlzdCcpLmFwcGVuZChzaG93UmVjaXBlKTtcbiAgICAgICAgfSk7XG59XG5cbi8vICB0aGUgZXZlbnRzIG1ldGhvZCB3aWxsIGhvbGQgZ2VuZXJhbCBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBzaXRlXG5mb29kQXBwLmV2ZW50cyA9ICgpID0+IHtcbiAgICAkKCcuaW5pdGlhbC1zZWFyY2gnKS5vbignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBpbmdyZWRpZW50cyA9ICQoJy5pbml0aWFsLXNlYXJjaC1ib3gnKS52YWwoKTtcbiAgICAgICAgJCgnLm1haW4td2VsY29tZS1wYWdlJykuaGlkZSgpO1xuICAgICAgICAkKCduYXYnKS5zaG93KCk7XG4gICAgICAgICQoJy5yZWNpcGUtc2VhcmNoLWJveCcpLnZhbCgkKCcuaW5pdGlhbC1zZWFyY2gtYm94JykudmFsKCkpO1xuICAgICAgICBmb29kQXBwLmdldEFsbFJlY2lwZXMoaW5ncmVkaWVudHMsICcnLCAnJywgJycpO1xuICAgIH0pO1xuICAgICQoJy5yZWNpcGUtc2VhcmNoJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gIHN0b3JlIHRoZSByZXN1bHRzIGZyb20gdGhlIGZvcm0gdG8gYmUgdXNlZCBsYXRlciBmb3IgcGFnaW5hdGlvblxuICAgICAgICBjb25zdCBpbmdyZWRpZW50cyA9ICQoJy5yZWNpcGUtc2VhcmNoLWJveCcpLnZhbCgpO1xuICAgICAgICBjb25zb2xlLmxvZyhpbmdyZWRpZW50cyk7XG4gICAgICAgIGNvbnN0IGNvdXJzZXMgPSAkKCdpbnB1dFtuYW1lPWNvdXJzZS10eXBlXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIGNvbnN0IGN1aXNpbmVzID0gJCgnaW5wdXRbbmFtZT1jdWlzaW5lLXR5cGVdOmNoZWNrZWQnKS5tYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICQodGhpcykudmFsKCk7XG4gICAgICAgIH0pLmdldCgpLmpvaW4oJycpO1xuICAgICAgICBjb25zdCBkaWV0YXJ5ID0gJCgnaW5wdXRbbmFtZT1kaWV0YXJ5LXJlc3RyaWN0aW9uc106Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgICAvLyAgc2VuZCB0aGUgc2VhcmNoIHJlc3VsdHMgdG8gdGhlIGdldEFsbFJlY2lwZXMgbWV0aG9kIHRvIHB1bGwgdGhlIGRhdGEgZnJvbSB0aGUgQVBJXG4gICAgICAgIGZvb2RBcHAuZ2V0QWxsUmVjaXBlcyhpbmdyZWRpZW50cywgY291cnNlcywgY3Vpc2luZXMsIGRpZXRhcnkpO1xuICAgIH0pO1xuICAgIC8vICBldmVudCBsaXN0ZW5lciB0byBjbGVhciB0aGUgc2VhcmNoIGZvcm1cbiAgICAkKCcuZm9ybS1yZXNldCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnLnJlY2lwZS1zZWFyY2gnKS50cmlnZ2VyKCdyZXNldCcpO1xuICAgIH0pXG4gICAgLy8gIGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgc2hvdyBwcmV2aW91cyBidXR0b24gdG8gc2hvdyBwcmV2aW91cyByZWNpcGUgcmVzdWx0c1xuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNob3ctcHJldmlvdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvb2RBcHAucmVjaXBlUGFnZXMtLTtcbiAgICAgICAgZm9vZEFwcC5kaXNwbGF5UmVjaXBlcyhmb29kQXBwLnBhZ2VkUmVzdWx0c1tmb29kQXBwLnJlY2lwZVBhZ2VzXSk7XG4gICAgfSk7XG4gICAgLy8gIGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgc2hvdyBtb3JlIGJ1dHRvbiB0byBzaG93IG1vcmUgcmVjaXBlIHJlc3VsdHNcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zaG93LW1vcmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvb2RBcHAucmVjaXBlUGFnZXMrKztcbiAgICAgICAgZm9vZEFwcC5kaXNwbGF5UmVjaXBlcyhmb29kQXBwLnBhZ2VkUmVzdWx0c1tmb29kQXBwLnJlY2lwZVBhZ2VzXSk7XG4gICAgfSk7XG59XG5cbi8vICB0aGUgaW5pdCBtZXRob2QgaW5pdGlhbGl6ZXMgYWxsIHRoZSBuZWNlc3NhcnkgbWV0aG9kcyB3aGVuIHRoZSBwYWdlIGxvYWRzXG5mb29kQXBwLmluaXQgPSAoKSA9PiB7XG4gICAgJCgnLnJlY2lwZS1zZWFyY2gnKS50cmlnZ2VyKCdyZXNldCcpO1xuICAgICQoJy5pbml0aWFsLXNlYXJjaCcpLnRyaWdnZXIoJ3Jlc2V0Jyk7XG4gICAgZm9vZEFwcC5ldmVudHMoKTtcbn07XG5cbi8vICBkb2N1bWVudC5yZWFkeSB0byBjYWxsIHRoZSBpbml0IG1ldGhvZCBvbmNlIHRoZSBwYWdlIGlzIGZpbmlzaGVkIGxvYWRpbmdcbiQoZnVuY3Rpb24gKCkge1xuICAgIGZvb2RBcHAuaW5pdCgpO1xufSk7Il19
