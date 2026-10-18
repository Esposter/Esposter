import type { HTMLElement } from "node-html-parser";

import { ALL_ATTRIBUTES_KEY, STRAY_TEXT_TYPE } from "#src/services/constants";
import { normalizeString } from "@esposter/shared";
import { TextNode } from "node-html-parser";

// A head's components as the root's props: each one the root's schema reads, and a component it does not name kept under its own tag
export const readMjmlHead = (head: HTMLElement): Record<string, unknown> => {
  const props: Record<string, unknown> = {};
  const attributesByType: Record<string, Record<string, string>> = {};
  const fonts: Record<string, string>[] = [];
  const styles: { css: string; inline: boolean }[] = [];
  for (const text of head.childNodes)
    if (text instanceof TextNode && normalizeString(text.text) !== "") props[STRAY_TEXT_TYPE] = text.text;
  for (const child of head.children) {
    switch (child.rawTagName) {
      case "mj-attributes":
        for (const grandchild of child.children)
          attributesByType[grandchild.rawTagName === "mj-all" ? ALL_ATTRIBUTES_KEY : grandchild.rawTagName] =
            grandchild.attributes;
        break;
      case "mj-breakpoint":
        props.breakpoint = child.attributes;
        break;
      case "mj-font":
        fonts.push(child.attributes);
        break;
      case "mj-preview":
        props.preview = child.text;
        break;
      case "mj-style":
        styles.push({ css: child.rawText, inline: child.attributes.inline === "inline" });
        break;
      case "mj-title":
        props.title = child.text;
        break;
      default:
        props[child.rawTagName] = child.attributes;
    }
  }

  if (Object.keys(attributesByType).length > 0) props.attributes = attributesByType;
  if (fonts.length > 0) props.fonts = fonts;
  if (styles.length > 0) props.styles = styles;
  return props;
};
