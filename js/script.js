const search = () => {
  const searchbox = document.getElementById("search").value.toUpperCase();
  document.getElementById("search").addEventListener("search", function(event) {
      $(".resultingarticles").empty();  
    });
  const allFood = document.getElementById("recipe-list");
  const recipe = document.querySelectorAll(".recipe")
  const recipeName = allFood.getElementsByTagName("h5","p")

  for(var i=0; i < recipeName.length; i++){
      let match = recipe[i].getElementsByTagName('h5','p')[0];

      if(match){
         let textValue = match.textContent || match.innerHTML

         if (textValue.toLocaleUpperCase().indexOf(searchbox) > - 1){
              recipe[i].style.display = "";
         }else{    
          recipe[i].style.display = "none";

         }
      }
  }
}


const recipes = [...document.querySelectorAll(".recipe")].map((recipeDOM) =>
recipeDOM.outerHTML.trim()
);

const recipeList = document.getElementById("recipe-list");
const getMealBtn = document.getElementById("veletlen");

getMealBtn.addEventListener("click", () => {
recipeList.innerHTML = recipes[Math.floor(Math.random() * recipes.length)];
});