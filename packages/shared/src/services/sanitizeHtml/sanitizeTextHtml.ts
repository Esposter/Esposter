import type { Attributes } from "sanitize-html";

import {
  CUSTOM_EMOJI_ID_ATTRIBUTE,
  CUSTOM_EMOJI_NAME_ATTRIBUTE,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_LABEL_ATTRIBUTE,
  MENTION_TYPE_ATTRIBUTE,
} from "#src/services/message/constants";
import { sanitizeHtml } from "#src/services/sanitizeHtml/sanitizeHtml";
import baseSanitizeHtml from "sanitize-html";

const COLOR_REGEXES = [/^#[\da-fA-F]{3,8}$/u, /^rgba?\(\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[\d.]+)?\)$/u, /^[a-z]+$/iu];

export const sanitizeTextHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedAttributes: {
      code: ["class"],
      input: ["checked", "disabled", "type"],
      li: ["data-checked", "data-type"],
      pre: ["class"],
      span: [
        "class",
        CUSTOM_EMOJI_ID_ATTRIBUTE,
        CUSTOM_EMOJI_NAME_ATTRIBUTE,
        MENTION_ID_ATTRIBUTE,
        MENTION_ITEM_TYPE_ATTRIBUTE,
        MENTION_LABEL_ATTRIBUTE,
        MENTION_TYPE_ATTRIBUTE,
        "style",
      ],
      ul: ["data-type"],
    },
    allowedStyles: {
      span: {
        "background-color": COLOR_REGEXES,
        "border-radius": [/^[\d.]+(?<unit>px|em|rem|%)$/u],
        color: COLOR_REGEXES,
      },
    },
    allowedTags: [...baseSanitizeHtml.defaults.allowedTags, "input", "label"],
    transformTags: {
      // A task item's checkbox is the one input rendered HTML carries, and it renders read-only: whatever the markup
      // Asked for, what leaves here is a disabled checkbox keeping only whether it was ticked
      input: (tagName, { checked }) => {
        const attribs: Attributes = { disabled: "", type: "checkbox" };
        if (checked !== undefined) attribs.checked = checked;
        return { attribs, tagName };
      },
    },
  });
