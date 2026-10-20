import type { HTMLElement } from "node-html-parser";

import { checkIsRepeatedMjmlTag } from "#src/services/checkIsRepeatedMjmlTag";
import { MJML_HEAD_SINGLE_TAGS } from "#src/services/constants";
import { getMjmlRefusalKey } from "#src/services/getMjmlRefusalKey";
import { readMjmlHeadText } from "#src/services/readMjmlHeadText";
import { readMjmlStrayText } from "#src/services/readMjmlStrayText";

// A head's components as the root's props, each one the root's schema reads, and a component it does not name refused under its own name
export const readMjmlHead = (head: HTMLElement): [string, unknown][] => {
  const entries: [string, unknown][] = Object.entries(readMjmlStrayText(head));
  // The head has no prop of its own to take an attribute, so one it carries is refused under its name, as a title's is
  if (Object.keys(head.attributes).length > 0) entries.push([getMjmlRefusalKey(head.rawTagName), head.attributes]);
  const readTagNames = new Set<string>();
  const typeAttributesMap = new Map<string, Record<string, string>>();
  const fonts: Record<string, string>[] = [];
  const styles: { css: string; inline: boolean }[] = [];
  for (const child of head.children) {
    // A tag read once is refused under its name when a second follows it, rather than replacing the first
    if (MJML_HEAD_SINGLE_TAGS.includes(child.rawTagName) && checkIsRepeatedMjmlTag(child.rawTagName, readTagNames)) {
      entries.push([getMjmlRefusalKey(child.rawTagName), child.attributes]);
      continue;
    }

    switch (child.rawTagName) {
      case "mj-attributes":
        // The defaults element takes no attributes of its own, so one it carries is refused under its name, as a title's is
        if (Object.keys(child.attributes).length > 0)
          entries.push([getMjmlRefusalKey(child.rawTagName), child.attributes]);
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
        // Only the inline attribute set to inline is modelled, so a style carrying anything else is refused under its name, as a title with one is
        if (Object.entries(child.attributes).every(([name, value]) => name === "inline" && value === "inline"))
          styles.push({ css: child.rawText, inline: child.attributes.inline === "inline" });
        else entries.push([getMjmlRefusalKey(child.rawTagName), child.attributes]);
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
