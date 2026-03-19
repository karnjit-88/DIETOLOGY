import { supabaseAdmin } from '../../../lib/supabase'

function isOwner(req) {
  return req.cookies?.dietology_owner === '1'
}

function generateCode() {
  return 'DT-' + Math.floor(1000 + Math.random() * 9000)
}

export default async function handler(req, res) {
  if (!isOwner(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name, email, plan_title, calories_per_day, start_date, expiry_date } = req.body
    if (!name || !plan_title || !expiry_date)
      return res.status(400).json({ error: 'Missing required fields' })

    let code = generateCode()
    for (let i = 0; i < 10; i++) {
      const { data: existing } = await supabaseAdmin
        .from('clients').select('id').eq('access_code', code).single()
      if (!existing) break
      code = generateCode()
    }

    const { data, error } = await supabaseAdmin.from('clients').insert({
      name, email, plan_title,
      calories_per_day: parseInt(calories_per_day) || 2000,
      start_date: start_date || new Date().toISOString().split('T')[0],
      expiry_date,
      access_code: code,
      is_active: true,
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  res.status(405).end()
}
