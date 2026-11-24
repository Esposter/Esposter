import type { AppNotification } from "#src/models/notification/AppNotification";

// The ids a delivered push toasts, from the answer its read brought back. A row the tab already held was toasted when
// It arrived, so only a row the held list lacks is new; and a row older than the newest held one is a page the read
// Grew, not a push. The stored timestamps keep milliseconds, so a row can tie with the newest held and still be new,
// Which is why the held ids settle ties. A tab holding nothing cannot tell the push's row from the rows before it, so
// The newest row of the answer stands for the push. Both lists are in page order, newest first, and the ids come back
// Oldest first
export const getToastedNotificationIds = (
  heldNotifications: readonly AppNotification[],
  answeredNotifications: readonly AppNotification[],
): string[] => {
  const [newestHeldNotification] = heldNotifications;
  if (!newestHeldNotification) {
    const [newestAnsweredNotification] = answeredNotifications;
    return newestAnsweredNotification ? [newestAnsweredNotification.id] : [];
  }

  const heldIds = new Set(heldNotifications.map(({ id }) => id));
  return answeredNotifications
    .filter(({ createdAt, id }) => !heldIds.has(id) && createdAt >= newestHeldNotification.createdAt)
    .toReversed()
    .map(({ id }) => id);
};
