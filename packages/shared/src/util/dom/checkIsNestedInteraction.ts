import { checkIsNestedControl } from "#src/util/dom/checkIsNestedControl";

// Whether a click on something that opens on a click belongs to what sits inside it instead: a control (checkIsNestedControl),
// Or the end of a drag that selected text. Whatever opens on a click asks this first, so a link in a row's notes opens the link and nothing else
export const checkIsNestedInteraction = (event: MouseEvent): boolean =>
  checkIsNestedControl(event) || Boolean(window.getSelection()?.toString());
