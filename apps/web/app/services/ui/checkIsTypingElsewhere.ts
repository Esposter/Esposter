// What a reader types into: a control that takes text, or an element they edit in place. A button, a checkbox or a link
// Holding focus is not typing, so a field may still take focus from it
const TEXT_ENTRY_SELECTOR =
  'textarea, select, [contenteditable]:not([contenteditable="false"]), input:not([type="button"], [type="checkbox"], [type="color"], [type="file"], [type="image"], [type="radio"], [type="range"], [type="reset"], [type="submit"])';

// Whether the reader is typing in some other element, which a control asking for focus must leave alone: it would take
// The keystrokes they are still making
export const checkIsTypingElsewhere = (element: Element) => {
  const { activeElement } = window.document;
  return (
    activeElement !== null &&
    activeElement !== element &&
    !element.contains(activeElement) &&
    activeElement.matches(TEXT_ENTRY_SELECTOR)
  );
};
