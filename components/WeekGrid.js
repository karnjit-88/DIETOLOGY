import { useState } from 'react'
import { getMealsForWeek } from '../lib/meals'

const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function getMonday(offset=0){
  const d=new Date();d.setHours(0,0,0,0)
  const day=d.getDay()
  d.setDate(d.getDate()-((day+6)%7)+offset*7)
  return d
}

function fmtShort(d){return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
function todayStr(){return new Date().toISOString().split('T')[0]}

export default function WeekGrid({initialOffset=0}){
  const [offset,setOffset]=useState(initialOffset)
  const meals=getMealsForWeek(offset)
  const monday=getMonday(offset)
  const sunday=new Date(monday);sunday.setDate(sunday.getDate()+6)

  return (
    <div>
      <div className="week-nav">
        <button className="wnav-btn" onClick={()=>setOffset(o=>o-1)}>‹</button>
        <span className="wnav-label">{fmtShort(monday)} — {fmtShort(sunday)}</span>
        <button className="wnav-btn" onClick={()=>setOffset(o=>o+1)}>›</button>
      </div>
      <div className="week-scroll">
        <div className="week-grid">
          {meals.map((day,i)=>{
            const date=new Date(monday);date.setDate(date.getDate()+i)
            const isToday=date.toISOString().split('T')[0]===todayStr()
            return(
              <div key={i} className={`day-card${isToday?' today':''}`}>
                <div className="day-hdr">{DAY_NAMES[i]} {date.getDate()}</div>
                <div className="meal-pill B">{day.breakfast}</div>
                <div className="meal-pill L">{day.lunch}</div>
                <div className="meal-pill D">{day.dinner}</div>
                <div className="meal-pill S">{day.snack}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="meal-legend">
        <span className="leg-item"><span className="leg-swatch" style={{background:'#f4c0d1'}}/>Breakfast</span>
        <span className="leg-item"><span className="leg-swatch" style={{background:'#bddcfa'}}/>Lunch</span>
        <span className="leg-item"><span className="leg-swatch" style={{background:'#c5ead9'}}/>Dinner</span>
        <span className="leg-item"><span className="leg-swatch" style={{background:'#f5eea3'}}/>Snack</span>
      </div>
    </div>
  )
}
