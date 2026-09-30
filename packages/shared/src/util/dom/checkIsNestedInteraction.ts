// What a click inside something that opens on a click belongs to instead: a link, a control, a field, a dialog or menu
// Mounted in its DOM, and a region that is its own control without being any of those
const NESTED_INTERACTION_SELECTOR = [
  "a[href]",
  "button",
  "dialog",
  "input",
  "label",
  "select",
  "summary",
  "textarea",
  "[contenteditable='']",
  "[contenteditable='plaintext-only']",
  "[contenteditable='true']",
  "[data-nested-interaction]",
  "[role='button']",
  "[role='checkbox']",
  "[role='dialog']",
  "[role='link']",
  "[role='menu']",
  "[role='menuitem']",
  "[role='option']",
  "[role='switch']",
  "[role='tab']",
].join(", ");
// Whether a click on something that opens on a click belongs to what sits inside it instead: a link, a control or a
// Field of its own, a dialog or menu mounted in its DOM, a region marked as its own control, or the end of a drag that
// Selected text. Whatever opens on a click asks this first, so a link in a row's notes opens the link and nothing else
export const checkIsNestedInteraction = (event: MouseEvent): boolean => {
  const { currentTarget, target } = event;
  if (!(currentTarget instanceof Element) || !(target instanceof Element)) return false;
  const interactiveElement = target.closest(NESTED_INTERACTION_SELECTOR);
  if (interactiveElement && interactiveElement !== currentTarget && currentTarget.contains(interactiveElement))
    return true;
  return Boolean(window.getSelection()?.toString());
};
