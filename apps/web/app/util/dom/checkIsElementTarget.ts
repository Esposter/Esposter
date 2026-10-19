// Cross-realm safe: elements from another document (the PiP window) fail `instanceof HTMLElement`
// Against this window's constructors, so detection duck-types on tagName instead.
export const checkIsElementTarget = (target: EventTarget | null): target is HTMLElement =>
  target !== null && "tagName" in target;
