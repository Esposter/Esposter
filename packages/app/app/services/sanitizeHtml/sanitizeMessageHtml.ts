import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { MENTION_ID_ATTRIBUTE, MENTION_LABEL_ATTRIBUTE, MENTION_TYPE_ATTRIBUTE } from "@esposter/shared";

export const sanitizeMessageHtml = (html: string) =>
  sanitizeHtml(html, {
    allowedAttributes: {
      a: ["href", "rel", "target"],
      code: ["class"],
      pre: ["class"],
      span: ["class", MENTION_ID_ATTRIBUTE, MENTION_LABEL_ATTRIBUTE, MENTION_TYPE_ATTRIBUTE, "style"],
    },
    allowedStyles: {
      span: {
        "background-color": [/.*/],
        "border-radius": [/.*/],
        color: [/.*/],
      },
    },
  });
