import type { HTMLElement } from "node-html-parser";

import { ALL_ATTRIBUTES_KEY } from "#src/services/constants";
import { readMjmlStrayText } from "#src/services/readMjmlStrayText";

// A head tag read as its text under its prop, unless it carries an attribute the text would drop: then it is kept under its own tag, which the root refuses
const readMjmlHeadText = (tag: HTMLElement, propName: string): Record<string, unknown> =>
  Object.keys(tag.attributes).length > 0 ? { [tag.rawTagName]: tag.attributes } : { [propName]: tag.text };

// A head's components as the root's props: each one the root's schema reads, and a component it does not name kept under its own tag
export const readMjmlHead = (head: HTMLElement): Record<string, unknown> => {
  const props: Record<string, unknown> = {};
  const typeAttributesMap: Record<string, Record<string, string>> = {};
  const fonts: Record<string, string>[] = [];
  const styles: { css: string; inline: boolean }[] = [];
  Object.assign(props, readMjmlStrayText(head));
  for (const child of head.children) {
    switch (child.rawTagName) {
      case "mj-attributes":
        for (const grandchild of child.children)
          typeAttributesMap[grandchild.rawTagName === "mj-all" ? ALL_ATTRIBUTES_KEY : grandchild.rawTagName] =
            grandchild.attributes;
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
        props[child.rawTagName] = child.attributes;
    }
  }

  if (Object.keys(typeAttributesMap).length > 0) props.attributes = typeAttributesMap;
  if (fonts.length > 0) props.fonts = fonts;
  if (styles.length > 0) props.styles = styles;
  return props;
};
