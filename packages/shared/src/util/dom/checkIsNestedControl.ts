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
// Whether a click on a control of its own sits inside what opens on a click, rather than being the click on that
// Container. A press asks this when it must leave a control alone, and a click asks checkIsNestedInteraction,
// Which adds the end of a text selection
export const checkIsNestedControl = (event: MouseEvent): boolean => {
  const { currentTarget, target } = event;
  if (!(currentTarget instanceof Element) || !(target instanceof Element)) return false;
  const interactiveElement = target.closest(NESTED_INTERACTION_SELECTOR);
  return Boolean(
    interactiveElement && interactiveElement !== currentTarget && currentTarget.contains(interactiveElement),
  );
};
