const navLinks = document.querySelector('.nav-links');
const navButton = document.querySelector('.nav-btn');

if (navLinks && navButton) {
  const setMenuState = (open) => {
    navLinks.classList.toggle('show-links', open);
    navButton.setAttribute('aria-expanded', String(open));
    navButton.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
  };

  navButton.addEventListener('click', () => {
    setMenuState(!navLinks.classList.contains('show-links'));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });
}

const date = document.getElementById('date');
if (date) date.textContent = new Date().getFullYear();
