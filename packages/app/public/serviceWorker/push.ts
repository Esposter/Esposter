import type { WebNotificationOptions } from "@vueuse/core";
import type { SetRequired } from "type-fest";

// https://github.com/vite-pwa/docs/issues/132
declare var self: ServiceWorkerGlobalScope;
declare var clients: Clients;

self.addEventListener("push", async ({ data, waitUntil }) => {
  if (!data) return;

  const jsonData = data.json() as SetRequired<WebNotificationOptions, "title">;
  const { title, ...rest } = jsonData;
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage(jsonData);
  }
  waitUntil(self.registration.showNotification(title, { ...rest }));
});

self.addEventListener("notificationclick", ({ notification, waitUntil }) => {
  notification.close();
  waitUntil(clients.openWindow(notification.data.url));
});
