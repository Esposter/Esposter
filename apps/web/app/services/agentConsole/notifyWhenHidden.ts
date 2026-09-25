// A browser notification, only while the tab is out of sight — a person watching the page needs no ping — and only
// Once permission was granted; asking is the page's to do on a click, never here. A browser without the API has no
// Global to read, so its absence is asked of the window rather than read off the name, which throws when undeclared
export const notifyWhenHidden = (title: string, body: string) =>
  !window.document.hidden || !("Notification" in window) || Notification.permission !== "granted"
    ? undefined
    : new Notification(title, { body });
