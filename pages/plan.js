import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import BrandLogo from '../components/BrandLogo'
import WeekGrid from '../components/WeekGrid'
import { usePushNotifications } from '../components/usePushNotifications'
import { MEAL_TIMES, getTodaysMeals } from '../lib/meals'

const AV_COLORS = ['av-0','av-1','av-2','av-3','av-4']
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
function fmt(d){return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
function fmtShort(d){return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}

function LoginScreen({onLogin}){
  const [code,setCode]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  async function handleSubmit(e){
    e.preventDefault();setError('');setLoading(true)
    const res=await fetch(`/api/plan?code=${code.trim().toUpperCase()}`)
    if(res.status===404){setError('Invalid code. Please check with your dietitian.');setLoading(false);return}
    if(res.status===403){const d=await res.json();onLogin(null,d);setLoading(false);return}
    if(res.ok){const data=await res.json();onLogin(data,null)}
    setLoading(false)
  }

  return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'1rem'}}><BrandLogo/></div>
          <p style={{fontSize:13,color:'var(--txm)'}}>Your personal meal plan</p>
        </div>
        <div className="card" style={{textAlign:'center'}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:'var(--m1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.25rem'}}>
            <svg width="28" height="28" viewBox="0 0 18 18" fill="var(--m)"><path d="M9 1.5L11.8 7H17L12.6 10.6L14.3 16.5L9 13.1L3.7 16.5L5.4 10.6L1 7H6.2Z"/></svg>
          </div>
          <h2 style={{fontSize:17,fontWeight:600,marginBottom:6}}>Welcome to your plan</h2>
          <p style={{fontSize:13,color:'var(--txm)',marginBottom:'1.5rem',lineHeight:1.6}}>Enter the access code your dietitian shared with you.</p>
          <form onSubmit={handleSubmit}>
            <input style={{width:'100%',padding:'12px',border:'1.5px solid var(--bd)',borderRadius:12,fontSize:20,fontFamily:'monospace',textAlign:'center',letterSpacing:3,textTransform:'uppercase',background:'var(--bg)',color:'var(--tx)',marginBottom:12}} placeholder="DT-0000" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={7} required/>
            {error&&<p style={{fontSize:12,color:'var(--r3)',marginBottom:10}}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center'}}>{loading?'Loading…':'View my plan'}</button>
          </form>
          <p style={{marginTop:'1.25rem',fontSize:11,color:'var(--txl)',borderTop:'1px solid var(--bd)',paddingTop:'1rem'}}>Don't have a code? Contact your DIETOLOGY dietitian.</p>
        </div>
      </div>
    </div>
  )
}

function ExpiredScreen({expiredData}){
  return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
      <div className="card" style={{maxWidth:400,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:44,marginBottom:'1rem'}}>🔒</div>
        <h2 style={{fontSize:17,fontWeight:600,marginBottom:8}}>Your plan has expired</h2>
        <p style={{fontSize:13,color:'var(--txm)',lineHeight:1.6,marginBottom:'1.25rem'}}>{expiredData?.message||'Your plan access has ended.'}</p>
        <div style={{background:'var(--r1)',border:'1px solid var(--r2)',borderRadius:12,padding:'1rem',fontSize:12,color:'var(--r3)'}}>
          Please contact your dietitian at <strong>DIETOLOGY</strong> to renew your subscription.
        </div>
      </div>
    </div>
  )
}

function ClientDashboard({plan,code}){
  const {permission,subscribed,loading:pushLoading,subscribe}=usePushNotifications(code)
  const todayMeals=getTodaysMeals()
  const avIndex=plan.name.charCodeAt(0)%5

  return(
    <div style={{maxWidth:860,margin:'0 auto',padding:'1.25rem 1rem 3rem'}}>
      <div className="card" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:'1rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className={`av ${AV_COLORS[avIndex]}`} style={{width:44,height:44,fontSize:14}}>{initials(plan.name)}</div>
          <div>
            <div style={{fontSize:16,fontWeight:600}}>Hello, {plan.name.split(' ')[0]}</div>
            <div style={{fontSize:12,color:'var(--txm)',marginTop:2}}>{plan.plan_title}</div>
          </div>
        </div>
        <span className={`badge badge-${plan.days_left<=7?'warn':'ok'}`}>
          <span className={`dot dot-${plan.days_left<=7?'warn':'ok'}`}/>
          {plan.days_left} days left
        </span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:'1rem'}}>
        {[
          {label:'Started',val:fmtShort(new Date(plan.start_date)),bg:'var(--m1)',border:'var(--m2)',color:'var(--m4)'},
          {label:'Calories/day',val:plan.calories_per_day,bg:'var(--s1)',border:'var(--s2)',color:'var(--s3)'},
          {label:'Progress',val:`${plan.progress}%`,bg:'var(--r1)',border:'var(--r2)',color:'var(--r3)'},
        ].map(m=>(
          <div key={m.label} style={{background:m.bg,border:`1px solid ${m.border}`,borderRadius:13,padding:'.75rem .875rem'}}>
            <div style={{fontSize:10,fontWeight:600,color:m.color,marginBottom:3,textTransform:'uppercase',letterSpacing:.4}}>{m.label}</div>
            <div style={{fontSize:15,fontWeight:600,color:m.color}}>{m.val}</div>
          </div>
        ))}
      </div>
      {!subscribed&&permission!=='denied'&&(
        <div style={{background:'var(--l1)',border:'1px solid var(--l2)',borderRadius:14,padding:'1rem',marginBottom:'1rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'var(--l3)',marginBottom:2}}>Enable meal reminders</div>
            <div style={{fontSize:11,color:'var(--l3)',lineHeight:1.5}}>Get notified at breakfast, lunch, snack & dinner time</div>
          </div>
          <button onClick={subscribe} disabled={pushLoading} style={{background:'var(--l3)',color:'#fff',border:'none',padding:'9px 18px',borderRadius:10,fontSize:13,fontWeight:500,cursor:'pointer',minHeight:40}}>
            {pushLoading?'Enabling…':'Enable'}
          </button>
        </div>
      )}
      {subscribed&&(
        <div style={{background:'var(--m1)',border:'1px solid var(--m2)',borderRadius:14,padding:'.875rem 1rem',marginBottom:'1rem',fontSize:12,color:'var(--m4)',fontWeight:500}}>
          ✓ Meal reminders are on — you'll be notified at meal times
        </div>
      )}
      <div className="notif-panel" style={{marginBottom:'1rem'}}>
        <div className="notif-title">Today's meal schedule</div>
        {Object.entries(MEAL_TIMES).map(([meal,time])=>(
          <div className="notif-item" key={meal}>
            <div className="notif-time">{time}</div>
            <div>
              <div className="notif-text" style={{textTransform:'capitalize'}}>{meal}</div>
              <div className="notif-meal">{todayMeals[meal]}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{marginBottom:'1rem'}}>
        <div style={{fontSize:13,fontWeight:500,color:'var(--txm)',marginBottom:'1rem'}}>Weekly meal plan</div>
        <WeekGrid/>
      </div>
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--txm)',marginBottom:6}}>
          <span>Plan progress</span><span>{plan.progress}% complete</span>
        </div>
        <div className="prog-track">
          <div className={`prog-fill${plan.days_left<=7?' amber':''}`} style={{width:`${plan.progress}%`}}/>
        </div>
        <div style={{fontSize:11,color:'var(--txm)',marginTop:8}}>
          Plan valid until <strong style={{color:'var(--tx)'}}>{fmt(plan.expiry_date)}</strong>. Access ends automatically after expiry.
        </div>
      </div>
    </div>
  )
}

export default function PlanPage(){
  const router=useRouter()
  const {code}=router.query
  const [plan,setPlan]=useState(null)
  const [expired,setExpired]=useState(null)
  const [loadingPlan,setLoadingPlan]=useState(false)

  useEffect(()=>{
    if(code){
      setLoadingPlan(true)
      fetch(`/api/plan?code=${code}`)
        .then(async res=>{
          if(res.status===403){const d=await res.json();setExpired(d)}
          else if(res.ok){const d=await res.json();setPlan(d)}
          else setExpired({message:'Invalid code.'})
          setLoadingPlan(false)
        })
        .catch(()=>setLoadingPlan(false))
    }
  },[code])

  function handleLogin(planData,expiredData){
    if(expiredData){setExpired(expiredData);return}
    setPlan(planData)
    router.replace(`/plan?code=${planData.access_code}`,undefined,{shallow:true})
  }

  const activeCode=plan?.access_code||code

  return(
    <>
      <Head>
        <title>{plan?`${plan.name.split(' ')[0]}'s Plan — Dietology`:'My Plan — Dietology'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#3db886"/>
      </Head>
      {loadingPlan?(
        <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <p style={{color:'var(--txm)',fontSize:13}}>Loading your plan…</p>
        </div>
      ):expired?(
        <ExpiredScreen expiredData={expired}/>
      ):plan?(
        <>
          <div className="topbar">
            <BrandLogo/>
            <span className="badge" style={{background:'var(--p1)',color:'#a04030',border:'1px solid var(--p2)'}}>Client portal</span>
          </div>
          <ClientDashboard plan={plan} code={activeCode}/>
        </>
      ):(
        <LoginScreen onLogin={handleLogin}/>
      )}
    </>
  )
}
