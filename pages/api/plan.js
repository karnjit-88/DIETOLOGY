import { supabaseAdmin } from '../../lib/supabase'
import { getMealsForWeek } from '../../lib/meals'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { code } = req.query
  if (!code) return res.status(400).json({ error: 'Missing code' })

  const { data: client, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('access_code', code.toUpperCase())
    .single()

  if (error || !client) return res.status(404).json({ error: 'Invalid access code' })

  const today = new Date().toISOString().split('T')[0]
  if (!client.is_active || client.expiry_date < today) {
    return res.status(403).json({
      error: 'expired',
      message: 'Your plan has expired. Please contact your dietitian to renew.',
      expiry_date: client.expiry_date,
    })
  }

  const expiry = new Date(client.expiry_date)
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const daysLeft = Math.round((expiry - now) / 86400000)
  const start = new Date(client.start_date)
  const totalDays = Math.max(1, Math.round((expiry - start) / 86400000))
  const elapsed = Math.max(0, Math.round((now - start) / 86400000))
  const progress = Math.min(100, Math.round((elapsed / totalDays) * 100))

  return res.status(200).json({
    id: client.id,
    name: client.name,
    plan_title: client.plan_title,
    calories_per_day: client.calories_per_day,
    start_date: client.start_date,
    expiry_date: client.expiry_date,
    days_left: daysLeft,
    progress,
    meals: getMealsForWeek(0),
    access_code: client.access_code,
  })
}
