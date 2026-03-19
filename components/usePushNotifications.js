import { useState, useEffect } from 'react'

export function usePushNotifications(accessCode) {
  const [permission, setPermission] = useState('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      if (Notification.permission === 'granted') checkExistingSubscription()
    }
  }, [])

  async function checkExistingSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) setSubscribed(true)
    } catch (e) {}
  }

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported in this browser.')
      return
    }
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') { setLoading(false); return }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode, subscription: sub.toJSON() }),
      })
      setSubscribed(true)
    } catch (err) {
      console.error('Push subscription failed:', err)
    }
    setLoading(false)
  }

  return { permission, subscribed, loading, subscribe }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}
