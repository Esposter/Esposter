// Keyboard shortcuts must never fire while the user is typing in an input, textarea, or rich-text editor
export const checkIsEditableTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName));
