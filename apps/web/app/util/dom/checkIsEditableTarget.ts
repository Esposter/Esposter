import { checkIsElementTarget } from "#src/util/dom/checkIsElementTarget";
import { EDITABLE_TAG_NAMES } from "#src/util/dom/constants";

// Keyboard shortcuts must never fire while the user is typing in an input, textarea, or rich-text editor.
export const checkIsEditableTarget = (target: EventTarget | null) => {
  if (!checkIsElementTarget(target)) return false;
  return target.isContentEditable || EDITABLE_TAG_NAMES.has(target.tagName);
};
