// A browser notification, only while the tab is out of sight — a person watching the page needs no ping — and only
// Once permission was granted; asking is the page's to do on a click, never here
export const notifyWhenHidden = (title: string, body: string) =>
  !window.document.hidden || Notification?.permission !== "granted" ? undefined : new Notification(title, { body });
