// The surfaces a notification can reach. `Bell` is the in-app panel — a persisted row that survives the reload
// And carries the unread badge; `Push` is the device, delivered by web-push to every session subscription.
export const NotificationChannel = { Bell: "Bell", Push: "Push" } as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];
