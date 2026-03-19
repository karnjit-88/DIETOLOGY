import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { code, subscription } = req.body
  if (!code || !subscription) return res.status(400).json({ error: 'Missing fields' })

  const today = new Date().toISOString().split('T')[0]
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id, expiry_date, is_active')
    .eq('access_code', code.toUpperCase())
    .single()

  if (!client || !client.is_active || client.expiry_date < today) {
    return res.status(403).json({ error: 'Plan expired or invalid' })
  }

  const { error } = await supabaseAdmin.from('push_subscriptions').upsert({
    client_id: client.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  }, { onConflict: 'client_id,endpoint' })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
