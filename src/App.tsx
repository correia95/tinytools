import { useEffect, useMemo, useState } from 'react';
import registry from './registry.json';
import { BRAND, TAGLINE } from './config';

interface AppEntry {
  slug: string;
  name: string;
  category: string;
  action: string;
  featured: boolean;
  launched: string;
  description: string;
}

const APPS = (registry.apps as AppEntry[]).slice().sort((a, b) => b.launched.localeCompare(a.launched));
const appUrl = (slug: string) => `https://${slug}.correia95.workers.dev/`;

const CATEGORY_ORDER = ['Games', 'Tools', 'Finance', 'Construction', 'Cars', 'Sports', 'Productivity', 'Other'];

const ICONS: Record<string, string> = {
  Games: '🎮',
  Tools: '🔧',
  Finance: '💸',
  Construction: '🧱',
  Cars: '🚗',
  Sports: '🏃',
  Productivity: '🗓️',
  Other: '✨',
};

// Display-only relabelling — keeps the underlying category value (used for
// filtering/URLs) stable while giving users a clearer chip/card label.
const LABELS: Record<string, string> = {
  Other: 'Fun & Other',
};
const labelFor = (cat: string) => LABELS[cat] ?? cat;

// Extra search terms per category so a query like "tax" or "building" finds
// relevant apps even when that exact word isn't in the name/description.
const CATEGORY_KEYWORDS: Record<string, string> = {
  Games: 'game play puzzle fun',
  Tools: 'tool utility converter generator checker',
  Finance: 'money tax salary budget loan invest saving bank business',
  Construction: 'building home house diy renovation material build',
  Cars: 'car vehicle auto driving fuel',
  Sports: 'fitness workout exercise training',
  Productivity: 'time schedule planner organize',
  Other: 'fun misc random',
};

const PAGE_SIZE = 30;

function Card({ app }: { app: AppEntry }) {
  return (
    <a className="card" href={appUrl(app.slug)}>
      <div className="card-top">
        <span className="card-ic" aria-hidden="true">{ICONS[app.category] ?? '✨'}</span>
        <span className="card-cat">{labelFor(app.category)}</span>
      </div>
      <h3>{app.name}</h3>
      <p>{app.description}</p>
      <span className="card-cta">{app.action} →</span>
    </a>
  );
}

function readInitialState() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  return {
    query: params.get('q') ?? '',
    cat: cat && CATEGORY_ORDER.includes(cat) ? cat : 'All',
  };
}

export default function App() {
  const [{ query, cat }, setState] = useState(readInitialState);
  const setQuery = (q: string) => setState((s) => ({ ...s, query: q }));
  const setCat = (c: string) => setState((s) => ({ ...s, cat: c }));
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Keep the URL in sync so search/category is bookmarkable, shareable, and
  // survives the browser Back button after visiting an app.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query);
    if (cat !== 'All') params.set('cat', cat);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [query, cat]);

  const cats = useMemo(() => {
    const present = new Set(APPS.map((a) => a.category));
    return ['All', ...CATEGORY_ORDER.filter((c) => present.has(c))];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APPS.filter((a) => {
      if (cat !== 'All' && a.category !== cat) return false;
      if (!q) return true;
      const hay = `${a.name} ${a.description} ${a.category} ${a.slug.replace(/-/g, ' ')} ${a.slug} ${CATEGORY_KEYWORDS[a.category] ?? ''}`.toLowerCase();
      return q.split(/\s+/).every((term) => hay.includes(term));
    });
  }, [query, cat]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, cat]);

  const featured = useMemo(() => APPS.filter((a) => a.featured), []);
  const isBrowsingAll = query.trim() === '' && cat === 'All';
  const shown = filtered.slice(0, visible);

  return (
    <div className="page">
      <div className="topnav">
        <div className="wrap topnav-row">
          <a className="brand" href="/" aria-label={`${BRAND} home`}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 2 11h3v9h5v-6h4v6h5v-9h3z" /></svg>
            <span>{BRAND}</span>
          </a>
          <input
            className="search"
            type="search"
            placeholder="Search tools & games…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search tools and games"
          />
          <nav className="toplinks">
            <a href="#categories">Categories</a>
            <a href="#all">All Tools</a>
          </nav>
        </div>
      </div>

      <header className="hero">
        <div className="wrap">
          <p className="kicker">{BRAND}</p>
          <h1>Small tools. Quick games.</h1>
          <p className="lede">{TAGLINE} No sign-ups, no tracking, everything runs in your browser.</p>
          <p className="count">{APPS.length} things to try</p>
        </div>
      </header>

      <main className="wrap">
        {isBrowsingAll && (
          <section className="block">
            <h2>Not sure where to start?</h2>
            <p className="subhead">A quick sample across categories — search or browse everything below.</p>
            <div className="grid">
              {featured.map((a) => (
                <Card key={a.slug} app={a} />
              ))}
            </div>
          </section>
        )}

        <section className="block" id="all">
          <div className="allhead">
            <h2>{isBrowsingAll ? 'Everything' : `Results (${filtered.length})`}</h2>
          </div>
          <div className="chips" id="categories">
            {cats.map((c) => (
              <button
                key={c}
                className={cat === c ? 'on' : ''}
                onClick={() => setCat(c)}
              >
                {c === 'All' ? 'All' : `${ICONS[c] ?? ''} ${labelFor(c)}`}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="none">
              Nothing matches that.{' '}
              <button className="clearall" onClick={() => setState({ query: '', cat: 'All' })}>
                Clear search &amp; filters
              </button>
            </p>
          ) : (
            <>
              <div className="grid">
                {shown.map((a) => (
                  <Card key={a.slug} app={a} />
                ))}
              </div>
              {visible < filtered.length && (
                <div className="more">
                  <button className="loadmore" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Load more ({filtered.length - visible} left)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="foot wrap">
        <p>
          {BRAND} — a growing pile of small web things, all free and client-side. Built in the open;
          each one links to its source.
        </p>
      </footer>
    </div>
  );
}
