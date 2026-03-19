import { supabaseAdmin } from '../../../../lib/supabase'

function isOwner(req) {
  return req.cookies?.dietology_owner === '1'
}

export default async function handler(req, res) {
  if (!isOwner(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.query

  if (req.method === 'PATCH') {
    const { expiry_date, is_active } = req.body
    const updates = {}
    if (expiry_date) updates.expiry_date = expiry_date
    if (typeof is_active === 'boolean') updates.is_active = is_active
    const { data, error } = await supabaseAdmin
      .from('clients').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const { error } = await supabaseAdmin.from('clients').update({
      is_active: false,
      expiry_date: yesterday.toISOString().split('T')[0],
    }).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  res.status(405).end()
}
