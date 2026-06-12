import {
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_LABEL_ATTRIBUTE,
  MENTION_TYPE_ATTRIBUTE,
} from "@/services/message/constants";
import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";

export const sanitizeMessageHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedAttributes: {
      a: ["href", "rel", "target"],
      code: ["class"],
      pre: ["class"],
      span: [
        "class",
        MENTION_ID_ATTRIBUTE,
        MENTION_ITEM_TYPE_ATTRIBUTE,
        MENTION_LABEL_ATTRIBUTE,
        MENTION_TYPE_ATTRIBUTE,
        "style",
      ],
    },
    allowedStyles: {
      span: {
        "background-color": [
          /^#[\da-fA-F]{3,8}$/u,
          /^rgba?\(\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[\d.]+)?\)$/u,
          /^[a-z]+$/iu,
        ],
        "border-radius": [/^[\d.]+(?<unit>px|em|rem|%)$/u],
        color: [/^#[\da-fA-F]{3,8}$/u, /^rgba?\(\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[\d.]+)?\)$/u, /^[a-z]+$/iu],
      },
    },
  });
