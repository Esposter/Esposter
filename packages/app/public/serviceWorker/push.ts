declare var self: ServiceWorkerGlobalScope;

self.addEventListener("push", async ({ data, waitUntil }) => {
  if (!data) return;

  const jsonData = data.json() as { title: string } & NotificationOptions;
  const { title, ...rest } = jsonData;
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage(jsonData);
  }
  waitUntil(self.registration.showNotification(title, { ...rest }));
});
