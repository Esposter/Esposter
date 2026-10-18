import type { HTMLElement } from "node-html-parser";

import { STRAY_TEXT_TYPE } from "#src/services/constants";
import { normalizeString } from "@esposter/shared";
import { TextNode } from "node-html-parser";

// The text a container holds outside its tags, kept under the stray text type when it is not blank
export const readMjmlStrayText = (element: HTMLElement): Record<string, string> => {
  const strayText: Record<string, string> = {};
  for (const text of element.childNodes)
    if (text instanceof TextNode && normalizeString(text.text) !== "") strayText[STRAY_TEXT_TYPE] = text.text;
  return strayText;
};
