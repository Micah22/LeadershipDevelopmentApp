////////////////////////
/// Made by Team AOF ///
////////////////////////

ServerEvents.recipes((event) => {
  const recipes = [
  
  ];

  recipes.forEach((recipe) => {
    event.shaped(recipe.output, recipe.pattern, recipe.key).id(recipe.id);
  });
});
