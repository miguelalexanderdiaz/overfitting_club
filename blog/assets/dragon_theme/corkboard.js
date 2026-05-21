/* ════════════════════════════════════════════════════════════════
 * Dragon corkboard filter
 *
 * Wires the .oc-tape-tab + .oc-tape-tag UI defined in corkboard-head.html
 * to Quarto's listing on the home page. No-ops on pages without an
 * oc-listing element, so it is safe to load site-wide.
 * ════════════════════════════════════════════════════════════════ */
(function () {
  function deriveSectionFromCard(card) {
    const link = card.querySelector('a[href*="posts/"]');
    if (!link) return 'other';
    const href = link.getAttribute('href') || '';
    if (href.indexOf('posts/thoughts')  !== -1) return 'thoughts';
    if (href.indexOf('posts/tutorials') !== -1) return 'tutorials';
    if (href.indexOf('posts/papers')    !== -1) return 'papers';
    return 'other';
  }

  // Tag every listing card on every page so the washi-tape color matches
  // the section. Runs unconditionally; the filter UI below is opt-in.
  function tagSectionsSiteWide() {
    document.querySelectorAll('.quarto-listing .quarto-post').forEach(el => {
      if (!el.hasAttribute('data-oc-section')) {
        el.setAttribute('data-oc-section', deriveSectionFromCard(el));
      }
    });
  }

  function init() {
    tagSectionsSiteWide();

    // Quarto renames #oc-listing -> #listing-oc-listing when it expands
    // the :::{#oc-listing}::: placeholder into the listing container.
    const listing =
      document.getElementById('listing-oc-listing') ||
      document.getElementById('oc-listing');
    if (!listing) return;
    const cards = Array.from(listing.querySelectorAll('.quarto-post'));
    if (!cards.length) return;

    const SECTIONS = {
      all:       { kicker: 'The Corkboard', title: 'Pinned to the <em>corkboard</em>',      caption: 'Drafts, experiments, half-thoughts. Filter by section, or by tag within.' },
      thoughts:  { kicker: 'Thoughts',      title: 'thoughts <em>— personal reflections and opinions</em>' },
      tutorials: { kicker: 'Tutorials',     title: 'tutorials <em>— detailed walkthroughs, with runnable code</em>' },
      papers:    { kicker: 'Papers',        title: 'papers <em>— paper replications, implemented from scratch</em>' },
    };

    const deriveSection = deriveSectionFromCard;

    function deriveTags(card) {
      const enc = card.getAttribute('data-categories');
      if (!enc) return [];
      try {
        return decodeURIComponent(atob(enc)).split(',').map(s => s.trim()).filter(Boolean);
      } catch (_) { return []; }
    }

    const posts = cards.map(el => ({
      el,
      section: deriveSection(el),
      tags: deriveTags(el),
    }));

    let activeSection = 'all';
    let activeTag = null;

    const tabs       = Array.from(document.querySelectorAll('.oc-tape-tab'));
    const clearBtn   = document.getElementById('oc-tape-clear');
    const kickerEl   = document.getElementById('oc-corkboard-kicker');
    const titleEl    = document.getElementById('oc-corkboard-title');
    const captionEl  = document.getElementById('oc-corkboard-caption');
    const tagsRow    = document.getElementById('oc-tape-tags');
    const emptyState = document.getElementById('oc-empty-state');
    const emptyBtn   = emptyState ? emptyState.querySelector('.oc-empty-clear') : null;

    function updateTabCounts() {
      tabs.forEach(tab => {
        const sec = tab.getAttribute('data-section');
        const n = sec === 'all' ? posts.length : posts.filter(p => p.section === sec).length;
        const cntEl = tab.querySelector('.oc-tape-count');
        if (cntEl) cntEl.textContent = n + ' ' + (n === 1 ? 'entry' : 'entries');
      });
    }

    function renderHeader() {
      const meta = SECTIONS[activeSection] || SECTIONS.all;
      if (kickerEl)  kickerEl.textContent = '§ ' + meta.kicker;
      if (titleEl)   titleEl.innerHTML    = meta.title;
      if (captionEl) {
        if (meta.caption) { captionEl.innerHTML = meta.caption; captionEl.hidden = false; }
        else captionEl.hidden = true;
      }
    }

    function renderTags() {
      const scope = activeSection === 'all' ? posts : posts.filter(p => p.section === activeSection);
      const counts = new Map();
      scope.forEach(p => p.tags.forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
      const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

      Array.from(tagsRow.querySelectorAll('.oc-tape-tag')).forEach(el => el.remove());
      sorted.forEach(pair => {
        const tag = pair[0], n = pair[1];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'oc-tape-tag' + (tag === activeTag ? ' is-active' : '');
        btn.setAttribute('data-tag', tag);
        btn.innerHTML = '#' + tag + '<sup>' + n + '</sup>';
        btn.addEventListener('click', () => {
          activeTag = activeTag === tag ? null : tag;
          apply();
        });
        tagsRow.appendChild(btn);
      });
      tagsRow.hidden = sorted.length === 0;
    }

    function applyFilters() {
      let visible = 0;
      posts.forEach(p => {
        const matchSec = activeSection === 'all' || p.section === activeSection;
        const matchTag = !activeTag || p.tags.indexOf(activeTag) !== -1;
        const ok = matchSec && matchTag;
        // Triple-hide to bulletproof against List.js or other CSS cascade
        // interfering: inline display, class token, and the HTML `hidden`
        // attribute. Any single one of these alone is enough.
        if (ok) {
          p.el.style.display = '';
          p.el.classList.remove('oc-hide');
          p.el.removeAttribute('hidden');
          p.el.removeAttribute('data-oc-hidden');
          visible++;
        } else {
          p.el.style.display = 'none';
          p.el.classList.add('oc-hide');
          p.el.setAttribute('hidden', '');
          p.el.setAttribute('data-oc-hidden', 'true');
        }
      });

      tabs.forEach(tab => {
        const on = tab.getAttribute('data-section') === activeSection;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      if (clearBtn) clearBtn.hidden = !(activeSection !== 'all' || activeTag);
      if (emptyState) emptyState.hidden = visible !== 0;
      listing.style.display = visible === 0 ? 'none' : '';
      listing.setAttribute('data-oc-empty', visible === 0 ? 'true' : 'false');

      if (window.__OC_DEBUG_FILTER) {
        console.log('[corkboard] activeSection=%s activeTag=%s visible=%d',
          activeSection, activeTag, visible,
          posts.map(p => ({ section: p.section, hidden: p.el.classList.contains('oc-hide') })));
      }
    }

    function apply() {
      renderHeader();
      renderTags();
      applyFilters();
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        activeSection = tab.getAttribute('data-section');
        activeTag = null;
        apply();
      });
    });
    if (clearBtn) clearBtn.addEventListener('click', () => {
      activeSection = 'all'; activeTag = null; apply();
    });
    if (emptyBtn) emptyBtn.addEventListener('click', () => {
      activeSection = 'all'; activeTag = null; apply();
    });

    updateTabCounts();
    apply();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
