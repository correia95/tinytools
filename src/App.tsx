import { useMemo, useState } from 'react';
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

function Card({ app }: { app: AppEntry }) {
  return (
    <a className="card" href={appUrl(app.slug)}>
      <div className="card-top">
        <span className="card-ic" aria-hidden="true">{ICONS[app.category] ?? '✨'}</span>
        <span className="card-cat">{app.category}</span>
      </div>
      <h3>{app.name}</h3>
      <p>{app.description}</p>
      <span className="card-cta">{app.action} →</span>
    </a>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('All');

  const cats = useMemo(() => {
    const present = new Set(APPS.map((a) => a.category));
    return ['All', ...CATEGORY_ORDER.filter((c) => present.has(c))];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APPS.filter((a) => {
      if (cat !== 'All' && a.category !== cat) return false;
      if (!q) return true;
      const hay = `${a.name} ${a.description} ${a.category} ${a.slug.replace(/-/g, ' ')} ${a.slug}`.toLowerCase();
      return q.split(/\s+/).every((term) => hay.includes(term));
    });
  }, [query, cat]);

  const featured = useMemo(() => APPS.filter((a) => a.featured), []);

  return (
    <div className="page">
      <header className="hero">
        <div className="wrap">
          <p className="kicker">{BRAND}</p>
          <h1>Small tools. Quick games.</h1>
          <p className="lede">{TAGLINE} No sign-ups, no tracking, everything runs in your browser.</p>
          <p className="count">{APPS.length} things to try</p>
        </div>
      </header>

      <main className="wrap">
        {query.trim() === '' && cat === 'All' && (
          <section className="block">
            <h2>Start here</h2>
            <div className="grid">
              {featured.map((a) => (
                <Card key={a.slug} app={a} />
              ))}
            </div>
          </section>
        )}

        <section className="block" id="all">
          <div className="allhead">
            <h2>{cat === 'All' && !query.trim() ? 'Everything' : 'Results'}</h2>
            <input
              className="search"
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tools and games"
            />
          </div>
          <div className="chips">
            {cats.map((c) => (
              <button
                key={c}
                className={cat === c ? 'on' : ''}
                onClick={() => setCat(c)}
              >
                {c === 'All' ? 'All' : `${ICONS[c] ?? ''} ${c}`}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="none">Nothing matches that.</p>
          ) : (
            <div className="grid">
              {filtered.map((a) => (
                <Card key={a.slug} app={a} />
              ))}
            </div>
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
