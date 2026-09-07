import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useNotificationStore } from "@/store/notification";
import { AppNotificationTypeChannelMap, NotificationChannel, pushNotificationPayloadSchema } from "@esposter/db-schema";
import { getResult } from "@esposter/shared";

// The other end of the wire the service worker has always had: every delivered push is posted to each open tab
// Before the OS notification is shown, and this is what listens. Without it a notification delivered while the
// App is open reaches the device and nothing on screen — the bell would only learn about it on the next reload.
//
// The tab re-reads rather than rendering the payload it was handed: the row the Function wrote is the one the
// Panel dismisses and marks read, so adopting the wire copy would put an entry in the list with no id the
// Server would recognise. One indexed page read is the price of the bell and the server agreeing.
export default defineNuxtPlugin(() => {
  if (!("serviceWorker" in window.navigator)) return;

  const { readNotifications } = useReadNotifications();
  const { storeDeliveredNotifications } = useNotificationStore();
  // The listener slot is synchronous, so the read is handed to the one sanctioned fire-and-forget rather than
  // Left floating — which is also what lets a test drain it instead of waiting for the panel to change. Which of
  // The rows it brings back are new is the store's to decide: it is the half of the list that owns them, and it
  // Also owns queueing overlapping pushes and reporting a read that failed
  const storeDeliveredNotification = getSynchronizedFunction(() => storeDeliveredNotifications(readNotifications));
  window.navigator.serviceWorker.addEventListener("message", (event) => {
    // The payload crosses a postMessage boundary, so it is parsed rather than trusted — an extension or another
    // Worker can post here too, and everything below reads fields off it
    const payload = getResult(() => pushNotificationPayloadSchema.parse(event.data)).unwrapOr(undefined);
    // Every push is posted here, including the ones whose type never asked for the bell — a chat message is read
    // Where the conversation is, and re-reading the panel for each one would be a query per message received
    if (!payload || !AppNotificationTypeChannelMap[payload.data.type].includes(NotificationChannel.Bell)) return;

    storeDeliveredNotification();
  });
});
