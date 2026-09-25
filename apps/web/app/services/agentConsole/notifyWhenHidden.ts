// A browser notification, only while the tab is out of sight — a person watching the page needs no ping — and only
// Once permission was granted; asking is the page's to do on a click, never here. A browser without the API has no
// Global to read, so its absence is checked by type rather than by optional chaining, which throws on an undeclared
// Name
export const notifyWhenHidden = (title: string, body: string) =>
  !window.document.hidden || typeof Notification === "undefined" || Notification.permission !== "granted"
    ? undefined
    : new Notification(title, { body });
