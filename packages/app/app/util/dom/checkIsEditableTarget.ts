const EDITABLE_TAG_NAMES = new Set(["INPUT", "SELECT", "TEXTAREA"]);

// Keyboard shortcuts must never fire while the user is typing in an input, textarea, or rich-text editor.
// Cross-realm safe: elements from another document (the PiP window) fail `instanceof HTMLElement`
// Against this window's constructors, so detection duck-types on tagName/isContentEditable instead.
export const checkIsEditableTarget = (target: EventTarget | null): boolean => {
  if (!target || !("tagName" in target)) return false;
  const element = target as HTMLElement;
  return element.isContentEditable || EDITABLE_TAG_NAMES.has(element.tagName);
};
