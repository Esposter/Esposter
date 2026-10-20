import type { HTMLElement } from "node-html-parser";

import { getMjmlRefusalKey } from "#src/services/getMjmlRefusalKey";

// A head tag with no prop of its own to take an attribute refuses the attribute under the tag's name, as a title's does, or reads nothing when it carries none
export const readMjmlAttributeRefusal = (tag: HTMLElement): [string, unknown][] =>
  Object.keys(tag.attributes).length > 0 ? [[getMjmlRefusalKey(tag.rawTagName), tag.attributes]] : [];
