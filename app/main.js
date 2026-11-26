// Hearth & Ledger — router and page shell. Reads the hash (#/expenses and so
// on), renders the matching view into #page, paints its charts and wires its
// controls, and marks the matching nav link as current. No network requests:
// every page is built from the local data.js module, and edits live in the
// browser for the visit.

import { VIEWS, notFoundView, setRerender } from './views.js';
import { redrawAllCharts } from './charts.js';

const page = document.getElementById('page');
const navLinks = [...document.querySelectorAll('nav a')];

function routeName() {
  const hash = location.hash.replace(/^#\/?/, '').split('?')[0];
  return hash === '' ? 'home' : hash;
}

function render() {
  const name = routeName();
  const view = VIEWS[name];
  if (view) {
    page.innerHTML = view.render();
    document.title = `${view.title} — Hearth & Ledger`;
  } else {
    page.innerHTML = notFoundView();
    document.title = 'Page not found — Hearth & Ledger';
  }
  navLinks.forEach((a) => {
    a.classList.toggle('active', a.dataset.route === name);
  });
  if (view && view.draw) view.draw();
  if (view && view.bind) view.bind();
  window.scrollTo(0, 0);
}

// The month summary in the header is static text in index.html
// ("November 2025 · $5,850 income"), set once per month by the site's maker.

// Views re-render the current page after an edit (a new expense, money added
// to a goal) by calling the rerender hook this registers.
setRerender(render);

window.addEventListener('hashchange', render);

// Charts are drawn from canvas sizes, so repaint them when the window size
// changes (a phone rotating, a desktop window resizing).
redrawAllCharts(() => {
  const view = VIEWS[routeName()];
  if (view && view.draw) view.draw();
});

render();
