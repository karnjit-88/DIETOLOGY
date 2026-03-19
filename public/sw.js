self.addEventListener('push', function(event) {
  if (!event.data) return
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'dietology-reminder',
    renotify: true,
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'View plan' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }
  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})
