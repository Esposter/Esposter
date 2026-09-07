import {
  CUSTOM_EMOJI_ID_ATTRIBUTE,
  CUSTOM_EMOJI_NAME_ATTRIBUTE,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_LABEL_ATTRIBUTE,
  MENTION_TYPE_ATTRIBUTE,
} from "#src/services/message/constants";
import { sanitizeHtml } from "#src/services/sanitizeHtml/sanitizeHtml";

const COLOR_REGEXES = [/^#[\da-fA-F]{3,8}$/u, /^rgba?\(\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[\d.]+)?\)$/u, /^[a-z]+$/iu];

export const sanitizeTextHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedAttributes: {
      a: ["href", "rel", "target"],
      code: ["class"],
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
    },
    allowedStyles: {
      span: {
        "background-color": COLOR_REGEXES,
        "border-radius": [/^[\d.]+(?<unit>px|em|rem|%)$/u],
        color: COLOR_REGEXES,
      },
    },
  });
