/*
 * Client-only enhancement: every treatment remains an ordinary <a href> to
 * a fully generated HTML page. Browsers can optionally open that page in
 * a side drawer without losing their position in the current catalogue.
 */
(() => {
  const layer = document.querySelector('#tgc-treatment-layer');
  const pane = document.querySelector('#tgc-treatment-pane');
  const body = document.querySelector('#tgc-treatment-body');
  if (!layer || !pane || !body) return;
  const originalPath = window.location.pathname + window.location.search + window.location.hash;
  const originalTitle = document.title;
  const originalOverflow = document.body.style.overflow;
  const cache = new Map();
  let activeRequest = 0;
  let previousFocus = null;

  function looksLikeTreatment(path) {
    return /^\/treatments\/[^/]+\/$/.test(path);
  }
  function validLocalTreatmentLink(anchor) {
    if (!anchor || anchor.target || anchor.hasAttribute('download') || anchor.dataset.noDrawer === 'true') return false;
    const url = new URL(anchor.href);
    return url.origin === window.location.origin && looksLikeTreatment(url.pathname);
  }
  function hide() {
    layer.hidden = true;
    pane.setAttribute('aria-busy', 'false');
    document.body.style.overflow = originalOverflow;
    body.replaceChildren();
    if (previousFocus && previousFocus.isConnected) previousFocus.focus({preventScroll:true});
  }
  async function show(path) {
    const requestId = ++activeRequest;
    layer.hidden = false;
    document.body.style.overflow = 'hidden';
    pane.setAttribute('aria-busy', 'true');
    body.innerHTML = '<div class="tgc-panel-loading" role="status">Opening treatment details…</div>';
    pane.focus({preventScroll:true});
    try {
      let content = cache.get(path);
      if (!content) {
        const response = await fetch(path, {headers: {'Accept': 'text/html'}});
        if (!response.ok) throw new Error('Treatment page unavailable: ' + response.status);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html,'text/html');
        const article = doc.querySelector('[data-treatment-detail]');
        if (!article) throw new Error('Missing rendered treatment detail');
        content = article;
        cache.set(path, article);
      }
      if (requestId !== activeRequest) return;
      const clone = document.importNode(content, true);
      body.replaceChildren(clone);
      pane.setAttribute('aria-busy', 'false');
      pane.scrollTop = 0;
      const h1 = body.querySelector('h1');
      if (h1) pane.setAttribute('aria-label', h1.textContent?.trim() || 'Treatment details');
    } catch (error) {
      if (requestId !== activeRequest) return;
      pane.setAttribute('aria-busy', 'false');
      body.replaceChildren();
      const p = document.createElement('p');
      p.textContent = 'We could not load the treatment preview. You can still open the full page.';
      const a = document.createElement('a');
      a.href = path;
      a.textContent = 'Open treatment page ↗';
      a.className = 'heritage-solid-button';
      body.append(p, a);
      console.warn('Treatment drawer:',error);
    }
  }

  function open(path) {
    if (layer.hidden) previousFocus = document.activeElement;
    window.history.pushState({tgcTreatmentPanel:true, path}, '', path);
    void show(path);
  }

  document.addEventListener('click', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor || !validLocalTreatmentLink(anchor)) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    // On a standalone treatment page direct navigation also remains available through the URL.
    event.preventDefault();
    open(new URL(anchor.href).pathname);
  });
  function close() {
    ++activeRequest;
    if (history.state?.tgcTreatmentPanel) window.history.back();
    else hide();
  }
  layer.querySelectorAll('[data-tgc-close]').forEach(button => button.addEventListener('click', close));
  window.addEventListener('popstate', event => {
    if (event.state?.tgcTreatmentPanel && looksLikeTreatment(event.state.path)) void show(event.state.path);
    else {
      ++activeRequest;
      hide();
    }
  });
  document.addEventListener('keydown', event => {
    if (layer.hidden) return;
    if (event.key === 'Escape') {event.preventDefault();close();return;}
    if (event.key !== 'Tab') return;
    const focusables = [...pane.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.getClientRects().length);
    if (!focusables.length) {event.preventDefault();pane.focus();return;}
    const first = focusables[0], last=focusables[focusables.length-1];
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && document.activeElement === last){event.preventDefault();first.focus();}
  });
})();
