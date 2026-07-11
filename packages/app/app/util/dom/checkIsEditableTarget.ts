export const checkIsEditableTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA");
