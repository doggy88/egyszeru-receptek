(() => {
  const searchInput = document.getElementById('search');
  const recipeList = document.getElementById('recipe-list');
  const randomButton = document.getElementById('veletlen');

  if (!searchInput || !recipeList) return;

  const recipes = Array.from(recipeList.querySelectorAll('.recipe'));
  let randomView = false;

  const normalize = (value = '') =>
    value
      .toLocaleLowerCase('hu-HU')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const recipeText = (recipe) => normalize(recipe.textContent);

  const status = document.createElement('span');
  status.className = 'search-count';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  searchInput.insertAdjacentElement('afterend', status);

  const emptyState = document.createElement('p');
  emptyState.className = 'empty-state';
  emptyState.textContent = 'Erre most nem találtunk receptet. Próbálj másik kifejezést!';

  const restoreAllRecipes = () => {
    if (!randomView) return;
    recipeList.replaceChildren(...recipes);
    randomView = false;
  };

  const matchingRecipes = () => {
    const query = normalize(searchInput.value);
    return query ? recipes.filter((recipe) => recipeText(recipe).includes(query)) : recipes;
  };

  const updateCount = (count) => {
    status.textContent = count + ' recept';
  };

  const filterRecipes = () => {
    restoreAllRecipes();
    const matches = new Set(matchingRecipes());

    recipes.forEach((recipe) => {
      recipe.hidden = !matches.has(recipe);
    });

    if (matches.size === 0) {
      recipeList.append(emptyState);
    } else {
      emptyState.remove();
    }

    updateCount(matches.size);
  };

  searchInput.addEventListener('input', filterRecipes);
  window.search = filterRecipes;

  randomButton?.addEventListener('click', () => {
    const candidates = matchingRecipes();
    if (candidates.length === 0) {
      filterRecipes();
      searchInput.focus();
      return;
    }

    const selected = candidates[Math.floor(Math.random() * candidates.length)].cloneNode(true);
    selected.hidden = false;
    recipeList.replaceChildren(selected);
    randomView = true;
    status.textContent = 'Mai véletlen receptünk';
    selected.focus({ preventScroll: true });
    selected.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  recipes.forEach((recipe) => {
    const title = recipe.querySelector('h5')?.textContent?.trim();
    const image = recipe.querySelector('img');
    if (image && !image.alt) image.alt = title ? title + ' – recept' : 'Receptfotó';
  });

  updateCount(recipes.length);
})();
