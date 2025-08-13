import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

function App() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signInWithEmail = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: 'your@email.com',
    })
    if (error) console.error(error)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error(error)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {session ? (
        <>
          <p className="mb-4">Signed in as {session.user.email}</p>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={signOut}>
            Sign Out
          </button>
        </>
      ) : (
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={signInWithEmail}>
          Sign In with Email
        </button>
      )}
    </div>
  )
}

export default App
