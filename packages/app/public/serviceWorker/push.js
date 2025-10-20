// https://github.com/vite-pwa/docs/issues/132
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const jsonData = event.data.json();
  const { title, ...rest } = jsonData;
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of clients) client.postMessage(jsonData);
      await self.registration.showNotification(title, rest);
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { url } = event.notification.data;
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of clients)
        if (client.url === url) {
          await client.focus();
          return;
        }
      await self.clients.openWindow(url);
    })(),
  );
});
