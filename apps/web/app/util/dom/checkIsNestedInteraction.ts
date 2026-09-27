import { NESTED_INTERACTION_SELECTOR } from "@/services/ui/constants";

// Whether a click on something that opens on a click belongs to what sits inside it instead: a link, a control or a
// Field of its own, a dialog or menu mounted in its DOM, a region marked as its own control, or the end of a drag that
// Selected text. Whatever opens on a click asks this first, so a link in a row's notes opens the link and nothing else
export const checkIsNestedInteraction = (event: MouseEvent) => {
  const { currentTarget, target } = event;
  if (!(currentTarget instanceof Element) || !(target instanceof Element)) return false;
  const interactiveElement = target.closest(NESTED_INTERACTION_SELECTOR);
  if (interactiveElement && interactiveElement !== currentTarget && currentTarget.contains(interactiveElement))
    return true;
  return Boolean(window.getSelection()?.toString());
};
