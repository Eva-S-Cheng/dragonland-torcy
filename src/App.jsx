import { useEffect, useState } from 'react'
import { useI18n, LANGS } from './i18n/index.jsx'

// ---------- Données restaurant (source unique de vérité) ----------
const RESTAURANT = {
  phone: '0164686780',
  phoneDisplay: '01 64 68 67 80',
  takeawayUrl: 'https://takeaway.tablemi.com/98654da88e1e727937fcff92?lang=fr',
  mapsUrl: 'https://maps.google.com/?q=Dragonland+Bay+1+Torcy',
  socials: [
    { name: 'Facebook', url: 'https://www.facebook.com/Dragonland-%E5%BF%A0%E8%AA%A0-215839242392397/' },
    { name: 'Tripadvisor', url: 'https://www.tripadvisor.fr/Restaurant_Review-g651715-d15660382-Reviews-Dragonland-Torcy_Marne_la_Vallee_Seine_et_Marne_Ile_de_France.html' },
    { name: 'Yelp', url: 'https://www.yelp.com/biz/dragonland-torcy' },
  ],
  // Horaires : format neutre HH:MM, mis en forme par langue au rendu. null = fermé
  hours: [
    { day: 'mon', lunch: ['11:45', '14:30'], dinner: ['18:30', '22:25'] },
    { day: 'tue', lunch: null, dinner: null },
    { day: 'wed', lunch: ['11:45', '14:30'], dinner: ['18:30', '22:25'] },
    { day: 'thu', lunch: ['11:45', '14:30'], dinner: ['18:30', '22:25'] },
    { day: 'fri', lunch: ['11:45', '14:30'], dinner: ['18:30', '22:25'] },
    { day: 'sat', lunch: ['11:45', '14:30'], dinner: ['18:45', '22:25'] },
    { day: 'sun', lunch: ['11:45', '14:30'], dinner: ['18:45', '22:25'] },
  ],
}

// ---------- Mini routeur hash ----------
const ROUTES = ['home', 'menu', 'contact']

function useHashRoute() {
  const get = () => {
    const h = window.location.hash.replace('#/', '')
    return ROUTES.includes(h) ? h : 'home'
  }
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const onHash = () => setRoute(get())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

// ---------- Composants ----------

function LangSwitcher() {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (!e.target.closest('.lang-dropdown')) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  return (
    <div className="lang-dropdown">
      <button
        className="lang-current"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {LANGS[lang].label} <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox" aria-label="Language">
          {Object.entries(LANGS).map(([code, { name }]) => (
            <li key={code}>
              <button
                role="option"
                aria-selected={lang === code}
                onClick={() => {
                  setLang(code)
                  setOpen(false)
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Header({ route }) {
  const { t } = useI18n()
  const [navOpen, setNavOpen] = useState(false)
  const close = () => setNavOpen(false)

  return (
    <header className="site-header">
      <div className="container">
        <a className="brand" href="#/home" onClick={close}>{t('brand')}</a>
        <nav className={`nav${navOpen ? ' open' : ''}`}>
          <a href="#/home" aria-current={route === 'home' ? 'page' : undefined} onClick={close}>{t('nav.home')}</a>
          <a href="#/menu" aria-current={route === 'menu' ? 'page' : undefined} onClick={close}>{t('nav.menu')}</a>
          <a href="#/contact" aria-current={route === 'contact' ? 'page' : undefined} onClick={close}>{t('nav.contact')}</a>
        </nav>
        <div className="header-actions">
          <LangSwitcher />
          <button
            className="menu-toggle"
            aria-label="Menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span aria-hidden="true">{navOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function CtaBar() {
  const { t } = useI18n()
  return (
    <nav className="cta-bar" aria-label="Actions rapides">
      <a href={RESTAURANT.takeawayUrl} target="_blank" rel="noreferrer">{t('cta.takeaway')}</a>
      <a href={`tel:${RESTAURANT.phone}`}>{t('cta.call')}</a>
    </nav>
  )
}

// Mise en forme des horaires selon la langue :
// fr → 11h45 ; en → 11:45 am (espace insécable) ; zh → 11:45（24h, usage courant）
function formatTime(hhmm, lang) {
  const [h, m] = hhmm.split(':').map(Number)
  if (lang === 'fr') return `${h}h${String(m).padStart(2, '0')}`
  if (lang === 'en') {
    const ampm = h < 12 ? 'am' : 'pm'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${String(m).padStart(2, '0')}\u00A0${ampm}`
  }
  return hhmm
}

function formatRange(range, lang) {
  return `${formatTime(range[0], lang)}\u00A0–\u00A0${formatTime(range[1], lang)}`
}

function HoursTable() {
  const { t, lang } = useI18n()
  return (
    <table className="hours-table">
      <tbody>
        {RESTAURANT.hours.map(({ day, lunch, dinner }) => (
          <tr key={day}>
            <td>{t(`hours.${day}`)}</td>
            {lunch ? (
              <>
                <td>{formatRange(lunch, lang)}</td>
                <td>{formatRange(dinner, lang)}</td>
              </>
            ) : (
              <td className="closed" colSpan={2}>{t('hours.closed')}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ---------- Pages (squelettes — remplies aux étapes 2 et 3+) ----------

function HomePage() {
  const { t } = useI18n()
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
          <p>{t('hero.note')}</p>
          <p style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href={RESTAURANT.takeawayUrl} target="_blank" rel="noreferrer">{t('cta.takeaway')}</a>
            <a className="btn btn-outline" href={`tel:${RESTAURANT.phone}`}>{t('cta.book')}</a>
          </p>
        </div>
      </section>
      <section className="section section-center">
        <div className="container">
          <h2>{t('hours.title')}</h2>
          <HoursTable />
        </div>
      </section>
    </>
  )
}

function MenuPage() {
  const { t } = useI18n()
  return (
    <section className="section">
      <div className="container">
        <h1>{t('menu.title')}</h1>
        <p>{t('menu.wip')}</p>
      </div>
    </section>
  )
}

function ContactPage() {
  const { t } = useI18n()
  return (
    <section className="section">
      <div className="container">
        <h1>{t('contact.title')}</h1>
        <div className="contact-grid">
          <div className="contact-card">
            <h2>Dragonland</h2>
            <p className="contact-address">{t('contact.address')}</p>
            <p className="contact-access">{t('contact.access')}</p>
            <div className="contact-actions">
              <a className="btn btn-primary" href={`tel:${RESTAURANT.phone}`}>
                {t('cta.call')} · {RESTAURANT.phoneDisplay}
              </a>
              <a className="btn btn-outline" href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer">
                {t('contact.directions')}
              </a>
            </div>
            <p className="contact-note">{t('contact.bookNote')}</p>
            <h3>{t('hours.title')}</h3>
            <HoursTable />
          </div>
          <div className="contact-map">
            <iframe
              title="Dragonland — Bay 1 Torcy"
              src="https://maps.google.com/maps?q=Dragonland%2C%2022%20promenade%20du%207%C3%A8me%20Art%2C%2077200%20Torcy&z=16&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- App ----------

// Pictos sociaux monochromes (hérite de currentColor)
const SOCIAL_ICONS = {
  Facebook: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Tripadvisor: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="7" cy="13" r="4.2" />
      <circle cx="17" cy="13" r="4.2" />
      <circle cx="7" cy="13" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="13" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.8 9.5C4.5 7.2 8 6 12 6s7.5 1.2 9.2 3.5M12 6l-1.5 2M12 6l1.5 2" strokeLinecap="round" />
    </svg>
  ),
  Yelp: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 10.5V3.5" />
      <path d="M10.2 13.2l-6.4 2.4" />
      <path d="M11.2 15.3l-3.6 5" />
      <path d="M13.6 15l2.6 5" />
      <path d="M14.2 12.6l6-1.4" />
    </svg>
  ),
}

export default function App() {
  const route = useHashRoute()
  const { t } = useI18n()
  return (
    <>
      <Header route={route} />
      <main>
        {route === 'home' && <HomePage />}
        {route === 'menu' && <MenuPage />}
        {route === 'contact' && <ContactPage />}
      </main>
      <footer className="site-footer">
        <div className="container">
          <p className="footer-socials">
            {RESTAURANT.socials.map(({ name, url }) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name} title={name}>
                {SOCIAL_ICONS[name] ?? name}
              </a>
            ))}
          </p>
          © {new Date().getFullYear()} Dragonland — Torcy · {t('footer.rights')}
        </div>
      </footer>
      <CtaBar />
    </>
  )
}