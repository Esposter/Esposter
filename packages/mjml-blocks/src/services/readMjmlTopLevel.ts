import type { HTMLElement } from "node-html-parser";

import { getMjmlRefusalKey } from "#src/services/getMjmlRefusalKey";
import { readMjmlStrayText } from "#src/services/readMjmlStrayText";

// The top level beside the one mjml, refused by name: text outside it by the stray text type, a tag before it under its own name,
// And a second element by #document. A source of one mjml and nothing else reads no refusal here
export const readMjmlTopLevel = (root: HTMLElement): [string, unknown][] => {
  const [mjml, ...others] = root.children;
  const strayText: [string, unknown][] = Object.entries(readMjmlStrayText(root));
  if (mjml?.rawTagName !== "mjml")
    return [...strayText, [mjml === undefined ? "#document" : getMjmlRefusalKey(mjml.rawTagName), {}]];
  if (others.length > 0) return [...strayText, ["#document", {}]];
  return strayText;
};
