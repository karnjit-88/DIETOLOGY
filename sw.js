self.addEventListener('push', function(event) {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      tag: data.tag || 'dietology',
      renotify: true,
      data: { url: data.url || '/client.html' }
    })
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/client.html'))
})
