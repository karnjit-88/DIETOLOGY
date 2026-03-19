import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import BrandLogo from '../components/BrandLogo'
import WeekGrid from '../components/WeekGrid'

const AV_COLORS = ['av-0','av-1','av-2','av-3','av-4']
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
function fmt(d){return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
function daysLeft(expiry){const now=new Date();now.setHours(0,0,0,0);return Math.round((new Date(expiry)-now)/86400000)}
function clientStatus(c){const dl=daysLeft(c.expiry_date);if(!c.is_active||dl<0)return 'exp';if(dl<=7)return 'warn';return 'ok'}
function today(){return new Date().toISOString().split('T')[0]}
function addDays(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().split('T')[0]}

export default function Dashboard() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showRenew, setShowRenew] = useState(false)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({name:'',email:'',plan_title:'',calories_per_day:'2000',start_date:today(),expiry_date:addDays(28)})
  const [renewDate, setRenewDate] = useState(addDays(28))

  useEffect(()=>{fetchClients()},[])

  async function fetchClients(){
    setLoading(true)
    const res = await fetch('/api/owner/clients')
    if(res.status===401){router.push('/owner-login');return}
    const data = await res.json()
    setClients(Array.isArray(data)?data:[])
    setLoading(false)
  }

  async function addClient(){
    const res = await fetch('/api/owner/clients',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(form),
    })
    if(res.ok){
      const newClient = await res.json()
      setClients(prev=>[newClient,...prev])
      setSelected(newClient)
      setShowAdd(false)
      setForm({name:'',email:'',plan_title:'',calories_per_day:'2000',start_date:today(),expiry_date:addDays(28)})
    }
  }

  async function renewClient(){
    const res = await fetch(`/api/owner/clients/${selected.id}`,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({expiry_date:renewDate,is_active:true}),
    })
    if(res.ok){
      const updated = await res.json()
      setClients(prev=>prev.map(c=>c.id===updated.id?updated:c))
      setSelected(updated)
      setShowRenew(false)
    }
  }

  async function revokeClient(){
    if(!confirm(`Revoke access for ${selected.name}?`))return
    const res = await fetch(`/api/owner/clients/${selected.id}`,{method:'DELETE'})
    if(res.ok){await fetchClients();setSelected(null)}
  }

  function copyCode(code){
    navigator.clipboard.writeText(`${window.location.origin}/plan?code=${code}`).catch(()=>{})
    setCopied(true)
    setTimeout(()=>setCopied(false),2000)
  }

  const stats={
    total:clients.length,
    active:clients.filter(c=>clientStatus(c)==='ok').length,
    expiring:clients.filter(c=>clientStatus(c)==='warn').length,
    expired:clients.filter(c=>clientStatus(c)==='exp').length,
  }

  const selStatus = selected?clientStatus(selected):null
  const selDaysLeft = selected?daysLeft(selected.expiry_date):0
  const selProgress = selected?(()=>{
    const start=new Date(selected.start_date)
    const end=new Date(selected.expiry_date)
    const now=new Date();now.setHours(0,0,0,0)
    const total=Math.max(1,Math.round((end-start)/86400000))
    const elapsed=Math.max(0,Math.round((now-start)/86400000))
    return Math.min(100,Math.round((elapsed/total)*100))
  })():0

  return (
    <>
      <Head>
        <title>Dashboard — Dietology</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#3db886"/>
      </Head>
      <div className="topbar">
        <BrandLogo/>
        <span className="badge badge-ok">Owner dashboard</span>
      </div>
      <div style={{maxWidth:980,margin:'0 auto',padding:'1.25rem 1rem 3rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:'1.5rem'}}>
          {[
            {label:'Total clients',val:stats.total,bg:'var(--m1)',border:'var(--m2)',color:'var(--m4)'},
            {label:'Active plans',val:stats.active,bg:'var(--s1)',border:'var(--s2)',color:'var(--s3)'},
            {label:'Expiring soon',val:stats.expiring,bg:'var(--y1)',border:'var(--y2)',color:'var(--y3)'},
            {label:'Expired',val:stats.expired,bg:'var(--r1)',border:'var(--r2)',color:'var(--r3)'},
          ].map(s=>(
            <div key={s.label} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:14,padding:'1rem'}}>
              <div style={{fontSize:11,fontWeight:600,color:s.color,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:26,fontWeight:600,color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <span style={{fontSize:13,fontWeight:500,color:'var(--txm)'}}>Client plans</span>
          <button className="btn-primary" onClick={()=>setShowAdd(true)}>+ Add client</button>
        </div>
        {loading?(
          <p style={{color:'var(--txm)',fontSize:13,padding:'1rem 0'}}>Loading…</p>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:'1.5rem'}}>
            {clients.map((c,i)=>{
              const st=clientStatus(c);const dl=daysLeft(c.expiry_date)
              return(
                <div key={c.id} className="card" style={{cursor:'pointer',border:selected?.id===c.id?'2px solid var(--m)':undefined,background:selected?.id===c.id?'var(--m1)':undefined}} onClick={()=>setSelected(c)}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <div className={`av ${AV_COLORS[i%5]}`}>{initials(c.name)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:14,color:'var(--tx)'}}>{c.name}</div>
                      <div style={{fontSize:12,color:'var(--txm)',marginTop:1}}>{c.plan_title}</div>
                    </div>
                    <span className={`badge badge-${st}`}><span className={`dot dot-${st}`}/>{st==='ok'?'Active':st==='warn'?'Expiring soon':'Expired'}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                    <span style={{color:st==='exp'?'var(--r3)':st==='warn'?'var(--y3)':'var(--txm)'}}>{st==='exp'?`Expired ${fmt(c.expiry_date)}`:`Expires ${fmt(c.expiry_date)}`}</span>
                    <span style={{fontFamily:'monospace',background:'#f2f2f2',padding:'2px 7px',borderRadius:6,color:'var(--txl)'}}>{c.access_code}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {selected&&(
          <div className="card" style={{marginBottom:'1.5rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10,marginBottom:'1.25rem'}}>
              <div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--tx)'}}>{selected.name}</div>
                <div style={{fontSize:12,color:'var(--txm)',marginTop:2}}>{selected.plan_title}</div>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button className="btn-sky" onClick={()=>{setRenewDate(addDays(28));setShowRenew(true)}}>Renew plan</button>
                <button className="btn-danger" onClick={revokeClient}>Revoke access</button>
              </div>
            </div>
            {selStatus==='exp'?(
              <div style={{textAlign:'center',padding:'2rem 1rem'}}>
                <div style={{fontSize:36,marginBottom:8}}>🔒</div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Plan expired</div>
                <div style={{fontSize:12,color:'var(--txm)'}}>Expired {fmt(selected.expiry_date)}. Click Renew plan to restore access.</div>
              </div>
            ):(
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:'1rem'}}>
                  {[
                    {label:'Start date',val:fmt(selected.start_date)},
                    {label:'Expires',val:fmt(selected.expiry_date)},
                    {label:'Days left',val:selDaysLeft,warn:selStatus==='warn'},
                    {label:'Calories/day',val:`${selected.calories_per_day} kcal`},
                  ].map(m=>(
                    <div key={m.label}>
                      <div style={{fontSize:11,color:'var(--txm)'}}>{m.label}</div>
                      <div style={{fontSize:13,fontWeight:600,color:m.warn?'var(--y3)':'var(--tx)',marginTop:2}}>{m.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:'1.25rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--txm)',marginBottom:5}}>
                    <span>Plan progress</span><span>{selProgress}%</span>
                  </div>
                  <div className="prog-track">
                    <div className={`prog-fill${selStatus==='warn'?' amber':''}`} style={{width:`${selProgress}%`}}/>
                  </div>
                </div>
                <div style={{marginBottom:'1.25rem'}}><WeekGrid/></div>
                <div style={{background:'var(--m1)',border:'1px solid var(--m2)',borderRadius:13,padding:'1rem'}}>
                  <div style={{fontSize:11,color:'var(--m4)',fontWeight:500,marginBottom:6}}>Client access link — copy and send via WhatsApp or email</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                    <code style={{fontSize:12,color:'var(--m4)',fontWeight:600,wordBreak:'break-all'}}>
                      {typeof window!=='undefined'?window.location.origin:'https://yourapp.vercel.app'}/plan?code={selected.access_code}
                    </code>
                    <button onClick={()=>copyCode(selected.access_code)} style={{background:'var(--card)',border:'1px solid var(--m2)',color:'var(--m4)',padding:'6px 16px',borderRadius:20,fontSize:12,fontWeight:500,cursor:'pointer',minHeight:34}}>
                      {copied?'Copied!':'Copy link'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {showAdd&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal">
            <div className="modal-title">Add new client</div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Full name *</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Client name"/></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="client@email.com"/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Plan title *</label><input className="form-input" value={form.plan_title} onChange={e=>setForm(f=>({...f,plan_title:e.target.value}))} placeholder="e.g. Weight loss 8wk"/></div>
              <div className="form-group"><label className="form-label">Calories / day</label><input className="form-input" value={form.calories_per_day} onChange={e=>setForm(f=>({...f,calories_per_day:e.target.value}))} placeholder="2000"/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Start date *</label><input className="form-input" type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Expiry date *</label><input className="form-input" type="date" value={form.expiry_date} onChange={e=>setForm(f=>({...f,expiry_date:e.target.value}))}/></div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn-primary" onClick={addClient} disabled={!form.name||!form.plan_title||!form.expiry_date}>Create client</button>
            </div>
          </div>
        </div>
      )}
      {showRenew&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowRenew(false)}>
          <div className="modal">
            <div className="modal-title">Renew plan for {selected?.name}</div>
            <div className="form-group"><label className="form-label">New expiry date</label><input className="form-input" type="date" value={renewDate} onChange={e=>setRenewDate(e.target.value)}/></div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={()=>setShowRenew(false)}>Cancel</button>
              <button className="btn-primary" onClick={renewClient}>Renew</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
