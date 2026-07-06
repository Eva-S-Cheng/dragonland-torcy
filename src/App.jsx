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

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

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

// ---------- Horaires ----------
// fr → 11h45 ; en → 11:45 am (insécable) ; zh → 11:45（24h）
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

function todayHours() {
  return RESTAURANT.hours.find((h) => h.day === DAY_KEYS[new Date().getDay()])
}

// Statut en direct : open / closingSoon (≤ 30 min de la fermeture) / closed
function openStatus() {
  const today = todayHours()
  if (!today?.lunch) return 'closed'
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  const toMins = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number)
    return h * 60 + m
  }
  for (const [start, end] of [today.lunch, today.dinner]) {
    const s = toMins(start)
    const e = toMins(end)
    if (mins >= s && mins < e) return e - mins <= 30 ? 'closingSoon' : 'open'
  }
  return 'closed'
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

// ---------- Sélecteur de langue ----------
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

// ---------- Header sticky ----------
function Header({ route }) {
  const { t } = useI18n()
  const [navOpen, setNavOpen] = useState(false)
  const close = () => setNavOpen(false)

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#/home" onClick={close}>
          <span className="brand-mark" aria-hidden="true">忠誠</span>
          <span className="brand-name">Dragonland</span>
        </a>

        <nav className={`nav${navOpen ? ' open' : ''}`}>
          <a href="#/home" aria-current={route === 'home' ? 'page' : undefined} onClick={close}>{t('nav.home')}</a>
          <a href="#/menu" aria-current={route === 'menu' ? 'page' : undefined} onClick={close}>{t('nav.menu')}</a>
          <a href="#/contact" aria-current={route === 'contact' ? 'page' : undefined} onClick={close}>{t('nav.contact')}</a>
        </nav>

        <div className="header-actions">
          <LangSwitcher />
          <a className="btn btn-primary header-cta" href={RESTAURANT.takeawayUrl} target="_blank" rel="noreferrer">
            {t('cta.takeaway')}
          </a>
          <a className="header-phone" href={`tel:${RESTAURANT.phone}`} aria-label={t('cta.call')}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
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

// ---------- Pages ----------
function HomePage() {
  const { t } = useI18n()
  const status = openStatus()
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>{t('hero.title')}</h1>
            <p className="hero-tagline">{t('hero.subtitle')}</p>
            <p className="hero-note">{t('hero.note')}</p>
            <div className="hero-cta">
              <a className="btn btn-light" href={RESTAURANT.takeawayUrl} target="_blank" rel="noreferrer">{t('cta.takeaway')}</a>
              <a className="btn btn-ghost" href={`tel:${RESTAURANT.phone}`}>{t('cta.book')}</a>
            </div>
          </div>
          <ul className="hero-status">
            <li className={`status-${status}`}>
              <span className="status-emoji" aria-hidden="true">🚪</span>
              {t(`status.${status}`)}
            </li>
            <li>
              <span className="status-emoji" aria-hidden="true">📞</span>
              <a href={`tel:${RESTAURANT.phone}`}>{RESTAURANT.phoneDisplay}</a>
            </li>
            <li>
              <span className="status-emoji" aria-hidden="true">📍</span>
              Bay 1 · Torcy
            </li>
          </ul>
        </div>
      </section>

      <section className="band band-surface">
        <div className="container">
          <div className="about-grid">
            <div className="about-main">
              <h2>{t('about.title')}</h2>
              <p>{t('about.text')}</p>
              <p>{t('about.text2')}</p>
            </div>
            <aside className="about-aside">
              <h3>{t('features.title')}</h3>
              <ul className="features">
                <li>{t('features.terrace')}</li>
                <li>{t('features.aircon')}</li>
                <li>{t('features.pmr')}</li>
                <li>{t('features.vouchers')}</li>
                <li>{t('features.takeaway')}</li>
              </ul>
              <p className="about-events">{t('about.events')}</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="band band-red">
        <div className="container hours-band">
          <div className="hours-band-text">
            <h2>{t('hours.title')}</h2>
            <p>{t('contact.bookNote')}</p>
            <a className="btn btn-light" href={`tel:${RESTAURANT.phone}`}>{t('cta.call')} · {RESTAURANT.phoneDisplay}</a>
          </div>
          <div className="hours-band-card">
            <HoursTable />
          </div>
        </div>
      </section>
    </>
  )
}

function MenuPage() {
  const { t } = useI18n()
  return (
    <section className="band">
      <div className="container">
        <h1 className="page-title">{t('menu.title')}</h1>
        <p>{t('menu.wip')}</p>
      </div>
    </section>
  )
}

function ContactPage() {
  const { t } = useI18n()
  return (
    <section className="band">
      <div className="container">
        <h1 className="page-title">{t('contact.title')}</h1>
        <div className="contact-grid">
          <div className="contact-card">
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
            <h2>{t('hours.title')}</h2>
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

// ---------- Barre CTA (mobile) ----------
function CtaBar() {
  const { t } = useI18n()
  return (
    <nav className="cta-bar" aria-label="Actions rapides">
      <a href={RESTAURANT.takeawayUrl} target="_blank" rel="noreferrer">{t('cta.takeaway')}</a>
      <a href={`tel:${RESTAURANT.phone}`}>{t('cta.call')}</a>
    </nav>
  )
}

// ---------- Pictos sociaux (monochromes, currentColor) ----------
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
}

// ---------- App ----------
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
        <div className="container footer-inner">
          <div>
            <span className="footer-brand">忠誠 · Dragonland</span>
            <p className="footer-line">{t('contact.address')}</p>
            <p className="footer-line">
              <a href={`tel:${RESTAURANT.phone}`}>{RESTAURANT.phoneDisplay}</a>
            </p>
          </div>
          <div className="footer-right">
            <p className="footer-socials">
              {RESTAURANT.socials.map(({ name, url }) => (
                <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name} title={name}>
                  {SOCIAL_ICONS[name] ?? name}
                </a>
              ))}
            </p>
            <p className="footer-line">© {new Date().getFullYear()} Dragonland — Torcy · {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
      <CtaBar />
    </>
  )
}