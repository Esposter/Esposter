import type { HTMLElement } from "node-html-parser";

import { MJML_HEAD_SINGLE_TAGS } from "#src/services/constants";
import { getMjmlRefusalKey } from "#src/services/getMjmlRefusalKey";
import { readMjmlStrayText } from "#src/services/readMjmlStrayText";

// A head tag read as its text under its prop, unless it carries an attribute the text would drop: then it is refused under its own name
const readMjmlHeadText = (tag: HTMLElement, propName: string): [string, unknown][] =>
  Object.keys(tag.attributes).length > 0
    ? [[getMjmlRefusalKey(tag.rawTagName), tag.attributes]]
    : [[propName, tag.text]];

// A head's components as the root's props, each one the root's schema reads, and a component it does not name refused under its own name
export const readMjmlHead = (head: HTMLElement): [string, unknown][] => {
  const entries: [string, unknown][] = Object.entries(readMjmlStrayText(head));
  const readTagNames = new Set<string>();
  const typeAttributesMap = new Map<string, Record<string, string>>();
  const fonts: Record<string, string>[] = [];
  const styles: { css: string; inline: boolean }[] = [];
  for (const child of head.children) {
    // A tag read once is refused under its name when a second follows it, rather than replacing the first
    if (MJML_HEAD_SINGLE_TAGS.includes(child.rawTagName) && readTagNames.has(child.rawTagName)) {
      entries.push([getMjmlRefusalKey(child.rawTagName), child.attributes]);
      continue;
    }

    readTagNames.add(child.rawTagName);
    switch (child.rawTagName) {
      case "mj-attributes":
        // Each default sits under its tag, mj-all included, and a second default for one tag is refused under its name
        for (const { attributes, rawTagName } of child.children)
          if (typeAttributesMap.has(rawTagName)) entries.push([getMjmlRefusalKey(rawTagName), attributes]);
          else typeAttributesMap.set(rawTagName, attributes);
        break;
      case "mj-breakpoint":
        entries.push(["breakpoint", child.attributes]);
        break;
      case "mj-font":
        fonts.push(child.attributes);
        break;
      case "mj-preview":
        entries.push(...readMjmlHeadText(child, "preview"));
        break;
      case "mj-style":
        styles.push({ css: child.rawText, inline: child.attributes.inline === "inline" });
        break;
      case "mj-title":
        entries.push(...readMjmlHeadText(child, "title"));
        break;
      default:
        entries.push([getMjmlRefusalKey(child.rawTagName), child.attributes]);
    }
  }

  if (typeAttributesMap.size > 0) entries.push(["attributes", Object.fromEntries(typeAttributesMap)]);
  if (fonts.length > 0) entries.push(["fonts", fonts]);
  if (styles.length > 0) entries.push(["styles", styles]);
  return entries;
};
