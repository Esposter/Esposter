import type { DefaultTreeAdapterTypes } from "parse5";

// A template is the one element that carries a content fragment, which parse5 gives it in place of child nodes of its
// Own
const checkIsTemplate = (element: DefaultTreeAdapterTypes.Element): element is DefaultTreeAdapterTypes.Template =>
  "content" in element;

// A template keeps its children in a fragment of their own rather than under the element
export const getChildNodes = (element: DefaultTreeAdapterTypes.Element): DefaultTreeAdapterTypes.ChildNode[] =>
  checkIsTemplate(element) ? element.content.childNodes : element.childNodes;
