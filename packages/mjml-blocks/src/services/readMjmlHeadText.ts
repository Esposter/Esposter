import type { HTMLElement } from "node-html-parser";

import { getMjmlRefusalKey } from "#src/services/getMjmlRefusalKey";

// A head tag read as its text under its prop, unless it carries an attribute the text would drop: then it is refused under its own name
export const readMjmlHeadText = (tag: HTMLElement, propName: string): [string, unknown][] =>
  Object.keys(tag.attributes).length > 0
    ? [[getMjmlRefusalKey(tag.rawTagName), tag.attributes]]
    : [[propName, tag.text]];
