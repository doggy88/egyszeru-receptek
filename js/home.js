(() => {
  const recipes = Array.isArray(window.RECIPE_DATA) ? window.RECIPE_DATA : [];
  const PAGE_SIZE = 12;
  const categoryOrder = ['Összes', 'Reggeli', 'Ebéd', 'Leves', 'Desszert', 'Szósz'];
  const categoryEmoji = {
    Reggeli: '☕',
    Ebéd: '🍽',
    Leves: '🥣',
    Desszert: '🍰',
    Szósz: '🥄',
    Egyéb: '🍴'
  };

  const state = {
    query: '',
    category: 'Összes',
    visible: PAGE_SIZE
  };

  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('recipe-search');
  const recipeGrid = document.getElementById('recipe-grid');
  const categoryList = document.getElementById('category-list');
  const resultTitle = document.getElementById('result-title');
  const resultSummary = document.getElementById('result-summary');
  const loadMoreButton = document.getElementById('load-more');
  const featuredGrid = document.getElementById('featured-grid');
  const dialog = document.getElementById('recipe-dialog');
  const dialogImage = document.getElementById('dialog-image');
  const dialogCategory = document.getElementById('dialog-category');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogSubtitle = document.getElementById('dialog-subtitle');
  const dialogLink = document.getElementById('dialog-link');
  const dialogClose = document.getElementById('dialog-close');
  const heroFeatureTitle = document.getElementById('hero-feature-title');
  const heroFeatureSubtitle = document.getElementById('hero-feature-subtitle');
  const heroFeatureLink = document.getElementById('hero-feature-link');

  if (!searchInput || !recipeGrid || !categoryList) return;

  const normalize = (value = '') =>
    value
      .toLocaleLowerCase('hu-HU')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const isExternal = (url) => /^https?:\/\//i.test(url || '');

  const configureLink = (link, recipe) => {
    link.href = recipe.url || '#';
    if (isExternal(recipe.url)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  };

  const fallbackImage = (category) => {
    const palettes = {
      Reggeli: ['#f3c978', '#fff1c9'],
      Ebéd: ['#d66a45', '#f6c2a8'],
      Leves: ['#4f876f', '#b9d7c8'],
      Desszert: ['#b85f78', '#efc1ce'],
      Szósz: ['#b8893e', '#ead09c'],
      Egyéb: ['#58736a', '#c8d6d0']
    };
    const colors = palettes[category] || palettes.Egyéb;
    const emoji = categoryEmoji[category] || categoryEmoji.Egyéb;
    const safeCategory = category || 'Recept';
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">' +
      '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="' + colors[0] +
      '"/><stop offset="1" stop-color="' + colors[1] + '"/></linearGradient></defs>' +
      '<rect width="900" height="560" fill="url(#g)"/>' +
      '<circle cx="740" cy="80" r="180" fill="rgba(255,255,255,.16)"/>' +
      '<circle cx="110" cy="520" r="220" fill="rgba(255,255,255,.10)"/>' +
      '<text x="450" y="265" text-anchor="middle" font-size="132">' + emoji + '</text>' +
      '<text x="450" y="370" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="#183027">' +
      safeCategory + '</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const createRecipeImage = (recipe, className) => {
    const image = document.createElement('img');
    image.className = className || '';
    image.alt = recipe.title + ' – recept';
    image.loading = 'lazy';
    image.decoding = 'async';

    const fallback = fallbackImage(recipe.category);
    image.src = recipe.image || fallback;
    image.addEventListener('error', () => {
      if (image.src !== fallback) image.src = fallback;
    }, { once: true });

    return image;
  };

  const createCard = (recipe) => {
    const link = document.createElement('a');
    link.className = 'recipe-card';
    configureLink(link, recipe);

    const media = document.createElement('div');
    media.className = 'card-media';
    media.append(createRecipeImage(recipe));

    const badge = document.createElement('span');
    badge.className = 'card-badge';
    badge.textContent = recipe.category;
    media.append(badge);

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.textContent = recipe.title;
    body.append(title);

    if (recipe.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.textContent = recipe.subtitle;
      body.append(subtitle);
    }

    const arrow = document.createElement('span');
    arrow.className = 'card-arrow';
    arrow.textContent = 'Recept megnyitása →';
    body.append(arrow);

    link.append(media, body);
    return link;
  };

  const filteredRecipes = () => {
    const query = normalize(state.query);
    return recipes.filter((recipe) => {
      const categoryMatches = state.category === 'Összes' || recipe.category === state.category;
      const haystack = normalize(recipe.title + ' ' + recipe.subtitle + ' ' + recipe.category);
      return categoryMatches && (!query || haystack.includes(query));
    });
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (state.query) params.set('q', state.query);
    if (state.category !== 'Összes') params.set('kategoria', state.category);
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
  };

  const renderCategories = () => {
    const counts = Object.fromEntries(categoryOrder.map((category) => [
      category,
      category === 'Összes' ? recipes.length : recipes.filter((recipe) => recipe.category === category).length
    ]));

    categoryList.replaceChildren(...categoryOrder.map((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category-chip' + (state.category === category ? ' is-active' : '');
      button.dataset.category = category;
      button.setAttribute('aria-pressed', String(state.category === category));
      button.append(document.createTextNode((category === 'Összes' ? '✦' : categoryEmoji[category]) + ' ' + category));

      const count = document.createElement('span');
      count.textContent = counts[category];
      button.append(count);

      button.addEventListener('click', () => {
        state.category = category;
        state.visible = PAGE_SIZE;
        render();
        document.getElementById('discovery').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      return button;
    }));
  };

  const renderRecipes = () => {
    const matches = filteredRecipes();
    const shown = matches.slice(0, state.visible);

    if (state.query) {
      resultTitle.textContent = 'Keresési találatok';
    } else if (state.category !== 'Összes') {
      resultTitle.textContent = state.category + ' receptek';
    } else {
      resultTitle.textContent = 'Ötletek a recepttárból';
    }

    resultSummary.textContent = matches.length + ' találat · egyszerre legfeljebb ' + PAGE_SIZE + ' új recept';

    if (shown.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const strong = document.createElement('strong');
      strong.textContent = 'Nincs találat';
      const text = document.createElement('span');
      text.textContent = 'Próbálj rövidebb kifejezést vagy válassz másik kategóriát.';
      empty.append(strong, text);
      recipeGrid.replaceChildren(empty);
    } else {
      recipeGrid.replaceChildren(...shown.map(createCard));
    }

    loadMoreButton.hidden = state.visible >= matches.length;
    updateUrl();
  };

  const render = () => {
    renderCategories();
    renderRecipes();
  };

  const renderFeatured = () => {
    const preferred = [
      'Bolognai Spagetti',
      'Csirkés Curry',
      'Gulyásleves',
      'Amerikai Palacsinta',
      'Tiramisu',
      'Tartármártás'
    ];
    const selected = preferred
      .map((title) => recipes.find((recipe) => recipe.title === title))
      .filter(Boolean);

    featuredGrid.replaceChildren(...selected.map((recipe) => {
      const link = document.createElement('a');
      link.className = 'featured-mini';
      configureLink(link, recipe);
      link.append(createRecipeImage(recipe));

      const category = document.createElement('span');
      category.textContent = recipe.category;
      const title = document.createElement('strong');
      title.textContent = recipe.title;
      link.append(category, title);
      return link;
    }));
  };

  const setHeroFeature = () => {
    if (!recipes.length) return;
    const dayNumber = Math.floor(Date.now() / 86400000);
    const recipe = recipes[dayNumber % recipes.length];
    heroFeatureTitle.textContent = recipe.title;
    heroFeatureSubtitle.textContent = recipe.subtitle || recipe.category + ' ötlet a mai napra';
    configureLink(heroFeatureLink, recipe);
  };

  const openRandomRecipe = () => {
    const pool = filteredRecipes();
    const source = pool.length ? pool : recipes;
    const recipe = source[Math.floor(Math.random() * source.length)];
    if (!recipe) return;

    dialogImage.replaceWith(createRecipeImage(recipe, 'dialog-image-replacement'));
    const replacement = document.querySelector('.dialog-image-replacement');
    replacement.id = 'dialog-image';
    window.requestAnimationFrame(() => {
      const current = document.getElementById('dialog-image');
      current.style.width = '100%';
      current.style.height = '100%';
      current.style.objectFit = 'cover';
    });

    dialogCategory.textContent = recipe.category;
    dialogTitle.textContent = recipe.title;
    dialogSubtitle.textContent = recipe.subtitle || 'Egy véletlen ötlet a recepttárból.';
    configureLink(dialogLink, recipe);

    document.body.classList.add('modal-open');
    dialog.showModal();
  };

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    state.visible = PAGE_SIZE;
    renderRecipes();
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.query = searchInput.value;
    state.visible = PAGE_SIZE;
    renderRecipes();
    document.getElementById('discovery').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  loadMoreButton.addEventListener('click', () => {
    state.visible += PAGE_SIZE;
    renderRecipes();
  });

  document.querySelectorAll('[data-random]').forEach((button) => {
    button.addEventListener('click', openRandomRecipe);
  });

  dialogClose.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const params = new URLSearchParams(location.search);
  state.query = params.get('q') || '';
  const requestedCategory = params.get('kategoria');
  if (categoryOrder.includes(requestedCategory)) state.category = requestedCategory;
  searchInput.value = state.query;

  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('recipe-total').textContent = recipes.length;

  renderFeatured();
  setHeroFeature();
  render();
})();
