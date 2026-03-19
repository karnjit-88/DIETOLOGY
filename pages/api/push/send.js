import webpush from 'web-push'
import { supabaseAdmin } from '../../../lib/supabase'
import { getTodaysMeals, MEAL_TIMES } from '../../../lib/meals'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

function getCurrentMeal() {
  const hour = new Date().getUTCHours()
  if (hour === 13) return 'breakfast'
  if (hour === 18) return 'lunch'
  if (hour === 21) return 'snack'
  if (hour === 0)  return 'dinner'
  return null
}

const MEAL_LABELS = {
  breakfast: 'Breakfast time',
  lunch: 'Lunch break',
  snack: 'Snack time',
  dinner: 'Dinner time',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const auth = req.headers.authorization
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const meal = getCurrentMeal()
  if (!meal) return res.status(200).json({ message: 'Not a notification hour', sent: 0 })

  const meals = getTodaysMeals()
  const mealText = meals[meal]
  const today = new Date().toISOString().split('T')[0]

  const { data: subscriptions, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*, clients!inner(expiry_date, is_active, access_code)')
    .eq('clients.is_active', true)
    .gte('clients.expiry_date', today)

  if (error) return res.status(500).json({ error: error.message })
  if (!subscriptions?.length) return res.status(200).json({ sent: 0 })

  let sent = 0, failed = 0
  const staleIds = []

  for (const sub of subscriptions) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth }
    }
    const payload = JSON.stringify({
      title: `Dietology — ${MEAL_LABELS[meal]}`,
      body: mealText,
      tag: `dietology-${meal}`,
      url: `/plan?code=${sub.clients.access_code}`,
    })
    try {
      await webpush.sendNotification(pushSub, payload)
      sent++
    } catch (err) {
      if (err.statusCode === 410) staleIds.push(sub.id)
      failed++
    }
  }

  if (staleIds.length) {
    await supabaseAdmin.from('push_subscriptions').delete().in('id', staleIds)
  }

  return res.status(200).json({ sent, failed, meal, mealText })
}
