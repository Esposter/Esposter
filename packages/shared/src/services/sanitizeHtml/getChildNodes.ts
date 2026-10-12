import type { DefaultTreeAdapterTypes } from "parse5";

// A template keeps its children in a fragment of their own rather than under the element
export const getChildNodes = (element: DefaultTreeAdapterTypes.Element): DefaultTreeAdapterTypes.ChildNode[] =>
  "content" in element ? (element.content as DefaultTreeAdapterTypes.DocumentFragment).childNodes : element.childNodes;
