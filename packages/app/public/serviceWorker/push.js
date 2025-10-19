// https://github.com/vite-pwa/docs/issues/132
self.addEventListener("push", async ({ data, waitUntil }) => {
  if (!data) return;

  const jsonData = data.json();
  const { title, ...rest } = jsonData;
  const clients = await self.clients.matchAll();

  for (const client of clients) client.postMessage(jsonData);

  waitUntil(self.registration.showNotification(title, rest));
});

self.addEventListener("notificationclick", ({ notification, waitUntil }) => {
  notification.close();
  waitUntil(self.clients.openWindow(notification.data.url));
});
