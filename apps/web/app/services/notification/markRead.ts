// A read row is the row itself; an unread one is copied with it marked read, so each row a read changes is a new row
export const markRead = <T extends { isRead: boolean }>(notification: T): T =>
  notification.isRead ? notification : { ...notification, isRead: true };
