// The surfaces a notification can reach. `Bell` is the in-app panel — a persisted row that survives the reload
// And carries the unread badge; `Push` is the device, delivered by web-push to every session subscription.
export enum NotificationChannel {
  Bell = "Bell",
  Push = "Push",
}
