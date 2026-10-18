import type { HTMLElement } from "node-html-parser";

import { ALL_ATTRIBUTES_KEY, MJML_HEAD_SINGLE_TAGS } from "#src/services/constants";
import { getMjmlRefusalKey } from "#src/services/getMjmlRefusalKey";
import { readMjmlStrayText } from "#src/services/readMjmlStrayText";

// A head tag read as its text under its prop, unless it carries an attribute the text would drop: then it is refused under its own name
const readMjmlHeadText = (tag: HTMLElement, propName: string): Record<string, unknown> =>
  Object.keys(tag.attributes).length > 0
    ? { [getMjmlRefusalKey(tag.rawTagName)]: tag.attributes }
    : { [propName]: tag.text };

// A head's components as the root's props: each one the root's schema reads, and a component it does not name refused under its own name
export const readMjmlHead = (head: HTMLElement): Record<string, unknown> => {
  const props: Record<string, unknown> = {};
  const readTagNames = new Set<string>();
  const typeAttributesMap: Record<string, Record<string, string>> = {};
  const fonts: Record<string, string>[] = [];
  const styles: { css: string; inline: boolean }[] = [];
  Object.assign(props, readMjmlStrayText(head));
  for (const child of head.children) {
    // A tag read once is refused under its name when a second follows it, rather than replacing the first
    if (MJML_HEAD_SINGLE_TAGS.includes(child.rawTagName) && readTagNames.has(child.rawTagName)) {
      props[getMjmlRefusalKey(child.rawTagName)] = child.attributes;
      continue;
    }

    readTagNames.add(child.rawTagName);
    switch (child.rawTagName) {
      case "mj-attributes":
        for (const grandchild of child.children) {
          const typeName = grandchild.rawTagName === "mj-all" ? ALL_ATTRIBUTES_KEY : grandchild.rawTagName;
          // A second default for one tag is refused under its name, not kept over the first
          if (Object.hasOwn(typeAttributesMap, typeName))
            props[getMjmlRefusalKey(grandchild.rawTagName)] = grandchild.attributes;
          else typeAttributesMap[typeName] = grandchild.attributes;
        }
        break;
      case "mj-breakpoint":
        props.breakpoint = child.attributes;
        break;
      case "mj-font":
        fonts.push(child.attributes);
        break;
      case "mj-preview":
        Object.assign(props, readMjmlHeadText(child, "preview"));
        break;
      case "mj-style":
        styles.push({ css: child.rawText, inline: child.attributes.inline === "inline" });
        break;
      case "mj-title":
        Object.assign(props, readMjmlHeadText(child, "title"));
        break;
      default:
        props[getMjmlRefusalKey(child.rawTagName)] = child.attributes;
    }
  }

  if (Object.keys(typeAttributesMap).length > 0) props.attributes = typeAttributesMap;
  if (fonts.length > 0) props.fonts = fonts;
  if (styles.length > 0) props.styles = styles;
  return props;
};
