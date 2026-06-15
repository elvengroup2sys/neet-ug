import { useEffect, useState } from 'react'
import './App.css'
import Auth from './components/Auth'
import { isFirebaseConfigured, watchAuthState } from './firebase'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = watchAuthState(setUser)
    return unsubscribe
  }, [])

  return (
    <div className="layout">
      <header className="header">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">N</span>
          <span>NeetDrill</span>
        </div>
        {isFirebaseConfigured && <Auth user={user} />}
      </header>

      {!isFirebaseConfigured && (
        <div className="config-banner" role="status">
          <strong>Firebase isn&apos;t configured yet.</strong> Copy{' '}
          <code>.env.example</code> to <code>.env</code> and fill in your
          Firebase web app config to enable sign-in and data storage.
        </div>
      )}

      <main className="main">
        <h1>Master NEET-UG, one concept at a time</h1>
        <p>
          Attempt real, verified previous year questions. Get a fresh
          AI-generated variation the moment you slip up, so you drill the
          exact concept until it sticks.
        </p>
        {isFirebaseConfigured && !user && (
          <p>Sign in above to start your first practice session.</p>
        )}
        {isFirebaseConfigured && user && (
          <p>Welcome back! Practice questions and progress tracking are coming soon.</p>
        )}
        {!isFirebaseConfigured && (
          <p>Practice questions and progress tracking are coming soon.</p>
        )}
      </main>

      <footer className="footer">
        Built for NEET-UG aspirants. Verified PYQs, unlimited adaptive practice.
      </footer>
    </div>
  )
}

export default App
