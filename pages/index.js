import Head from 'next/head'
import BrandLogo from '../components/BrandLogo'

export default function Home() {
  return (
    <>
      <Head>
        <title>Dietology</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#3db886"/>
      </Head>
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:'2.5rem'}}>
          <BrandLogo/>
        </div>
        <h1 style={{fontSize:22,fontWeight:600,marginBottom:10,color:'var(--tx)'}}>Personalised diet plans,<br/>protected & time-limited</h1>
        <p style={{fontSize:14,color:'var(--txm)',maxWidth:360,lineHeight:1.7,marginBottom:'2rem'}}>
          Your clients access their plans securely. Access expires automatically — protecting your work.
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:12,width:'100%',maxWidth:300}}>
          <a href="/dashboard"><button className="btn-primary" style={{width:'100%',justifyContent:'center'}}>Owner dashboard →</button></a>
          <a href="/plan"><button className="btn-ghost" style={{width:'100%'}}>View my plan (clients)</button></a>
        </div>
      </div>
    </>
  )
}
