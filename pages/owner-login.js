import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import BrandLogo from '../components/BrandLogo'

export default function OwnerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/owner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Owner Login — Dietology</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#3db886"/>
      </Head>
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
        <div style={{width:'100%',maxWidth:400}}>
          <div style={{textAlign:'center',marginBottom:'2rem'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:'1rem'}}><BrandLogo/></div>
            <p style={{fontSize:13,color:'var(--txm)'}}>Owner dashboard</p>
          </div>
          <div className="card">
            <h2 style={{fontSize:17,fontWeight:600,marginBottom:'1.5rem',color:'var(--tx)'}}>Sign in</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="owner@dietology.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/>
              </div>
              {error && <p style={{fontSize:12,color:'var(--r3)',marginBottom:12}}>{error}</p>}
              <button className="btn-primary" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:4}}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
          <p style={{textAlign:'center',marginTop:'1.5rem',fontSize:12,color:'var(--txl)'}}>
            Are you a client? <a href="/plan" style={{color:'var(--m)',fontWeight:500}}>View your plan →</a>
          </p>
        </div>
      </div>
    </>
  )
}
