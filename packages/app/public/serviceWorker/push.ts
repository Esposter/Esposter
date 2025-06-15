import type { WebNotificationOptions } from "@vueuse/core";
import type { SetRequired } from "type-fest";
// https://github.com/vite-pwa/docs/issues/132
declare const self: ServiceWorkerGlobalScope;
declare const clients: Clients;

self.addEventListener("push", async ({ data }) => {
  if (!data) return;

  const jsonData = data.json() as SetRequired<WebNotificationOptions, "title">;
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage(jsonData);
  }
});

self.addEventListener("notificationclick", ({ notification, waitUntil }) => {
  notification.close();
  waitUntil(clients.openWindow(notification.data.url));
});
