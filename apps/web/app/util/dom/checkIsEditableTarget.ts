import { checkIsElementTarget } from "@/util/dom/checkIsElementTarget";

const EDITABLE_TAG_NAMES = new Set(["INPUT", "SELECT", "TEXTAREA"]);
// Keyboard shortcuts must never fire while the user is typing in an input, textarea, or rich-text editor.
export const checkIsEditableTarget = (target: EventTarget | null) => {
  if (!checkIsElementTarget(target)) return false;
  return target.isContentEditable || EDITABLE_TAG_NAMES.has(target.tagName);
};
