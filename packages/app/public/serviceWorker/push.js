// https://github.com/vite-pwa/docs/issues/132
self.addEventListener("push", ({ data, waitUntil }) => {
  if (!data) return;

  const jsonData = data.json();
  const { title, ...rest } = jsonData;
  waitUntil(async () => {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    for (const client of clients) client.postMessage(jsonData);
    await self.registration.showNotification(title, rest);
  })();
});

self.addEventListener("notificationclick", async ({ notification, waitUntil }) => {
  notification.close();
  const { url } = notification.data;
  waitUntil(
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
