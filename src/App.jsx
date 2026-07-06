import { useEffect, useState } from 'react'
import { useI18n, LANGS } from './i18n/index.jsx'

// ---------- Données restaurant (source unique de vérité) ----------
const RESTAURANT = {
  phone: '0164686780',
  phoneDisplay: '01 64 68 67 80',
  takeawayUrl: 'https://takeaway.tablemi.com/', // TODO: lien exact TableMi Dragonland
  ubereatsUrl: 'https://www.ubereats.com/', // TODO: lien exact page Uber Eats
  mapsUrl: 'https://maps.google.com/?q=Dragonland+Bay+1+Torcy',
  // Horaires : null = fermé
  hours: [
    { day: 'mon', lunch: '11h45 – 14h30', dinner: '18h30 – 22h25' },
    { day: 'tue', lunch: null, dinner: null },
    { day: 'wed', lunch: '11h45 – 14h30', dinner: '18h30 – 22h25' },
    { day: 'thu', lunch: '11h45 – 14h30', dinner: '18h30 – 22h25' },
    { day: 'fri', lunch: '11h45 – 14h30', dinner: '18h30 – 22h25' },
    { day: 'sat', lunch: '11h45 – 14h30', dinner: '18h45 – 22h25' },
    { day: 'sun', lunch: '11h45 – 14h30', dinner: '18h45 – 22h25' },
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
  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {Object.entries(LANGS).map(([code, { label, name }]) => (
        <button
          key={code}
          aria-pressed={lang === code}
          title={name}
          onClick={() => setLang(code)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function Header({ route }) {
  const { t } = useI18n()
  return (
    <header className="site-header">
      <div className="container">
        <a className="brand" href="#/home">Dragonland</a>
        <nav className="nav">
          <a href="#/home" aria-current={route === 'home' ? 'page' : undefined}>{t('nav.home')}</a>
          <a href="#/menu" aria-current={route === 'menu' ? 'page' : undefined}>{t('nav.menu')}</a>
          <a href="#/contact" aria-current={route === 'contact' ? 'page' : undefined}>{t('nav.contact')}</a>
        </nav>
        <LangSwitcher />
      </div>
    </header>
  )
}

function CtaBar() {
  const { t } = useI18n()
  return (
    <nav className="cta-bar" aria-label="Actions rapides">
      <a href={RESTAURANT.takeawayUrl} target="_blank" rel="noreferrer">{t('cta.takeaway')}</a>
      <a href={RESTAURANT.ubereatsUrl} target="_blank" rel="noreferrer">{t('cta.delivery')}</a>
      <a href={`tel:${RESTAURANT.phone}`}>{t('cta.call')}</a>
    </nav>
  )
}

function HoursTable() {
  const { t } = useI18n()
  return (
    <table className="hours-table">
      <tbody>
        {RESTAURANT.hours.map(({ day, lunch, dinner }) => (
          <tr key={day}>
            <td>{t(`hours.${day}`)}</td>
            {lunch ? (
              <>
                <td>{lunch}</td>
                <td>{dinner}</td>
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
            <a className="btn btn-primary" href={RESTAURANT.ubereatsUrl} target="_blank" rel="noreferrer">{t('cta.delivery')}</a>
            <a className="btn btn-outline" href={`tel:${RESTAURANT.phone}`}>{t('cta.book')}</a>
          </p>
        </div>
      </section>
      <section className="section">
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
        <p>{t('contact.address')}</p>
        <p>
          <a className="btn btn-outline" href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer">{t('contact.directions')}</a>
        </p>
        <p>
          {t('contact.phone')} : <a href={`tel:${RESTAURANT.phone}`}>{RESTAURANT.phoneDisplay}</a>
          <br />
          {t('contact.bookNote')}
        </p>
        <h2>{t('hours.title')}</h2>
        <HoursTable />
      </div>
    </section>
  )
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
        <div className="container">
          © {new Date().getFullYear()} Dragonland — Torcy · {t('footer.rights')}
        </div>
      </footer>
      <CtaBar />
    </>
  )
}
