import { useState } from 'react'
import { signInWithGoogle, signOutUser } from '../firebase'

export default function Auth({ user }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('Sign-in failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setError(null)
    try {
      await signOutUser()
    } catch (err) {
      setError('Sign-out failed. Please try again.')
      console.error(err)
    }
  }

  if (user) {
    return (
      <div className="auth">
        <span className="auth__name">Hi, {user.displayName?.split(' ')[0] || 'there'}</span>
        <button className="btn btn--ghost" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="auth">
      {error && <span className="auth__error">{error}</span>}
      <button className="btn btn--primary" onClick={handleSignIn} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in with Google'}
      </button>
    </div>
  )
}
