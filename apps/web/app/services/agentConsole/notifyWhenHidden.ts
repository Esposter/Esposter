// A browser notification, only while the tab is out of sight — a person watching the page needs no ping — and only
// Once permission was granted; asking is the page's to do on a click, never here
export const notifyWhenHidden = (title: string, body: string): void => {
  if (!document.hidden || Notification?.permission !== "granted") return;
  new Notification(title, { body });
};
