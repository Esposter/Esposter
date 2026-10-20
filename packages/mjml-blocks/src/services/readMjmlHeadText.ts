import type { HTMLElement } from "node-html-parser";

import { readMjmlAttributeRefusal } from "#src/services/readMjmlAttributeRefusal";

// A head tag read as its text under its prop, unless it carries an attribute the text would drop: then it is refused under its own name
export const readMjmlHeadText = (tag: HTMLElement, propName: string): [string, unknown][] => {
  const refusal = readMjmlAttributeRefusal(tag);
  return refusal.length > 0 ? refusal : [[propName, tag.text]];
};
