import type { WebNotificationOptions } from "@vueuse/core";
import type { SetRequired } from "type-fest";
// https://github.com/vite-pwa/docs/issues/132
declare const self: ServiceWorkerGlobalScope;
declare const clients: Clients;

self.addEventListener("push", async (event) => {
  if (!event.data) return;

  const data = event.data.json() as SetRequired<WebNotificationOptions, "title">;
  const { title, ...rest } = data;
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage(data);
  }
  event.waitUntil(self.registration.showNotification(title, rest));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
