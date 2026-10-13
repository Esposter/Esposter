import {
  CUSTOM_EMOJI_ID_ATTRIBUTE,
  CUSTOM_EMOJI_NAME_ATTRIBUTE,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_LABEL_ATTRIBUTE,
  MENTION_TYPE_ATTRIBUTE,
  SPOILER_ATTRIBUTE,
} from "#src/services/message/constants";
import { DEFAULT_ALLOWED_TAGS } from "#src/services/sanitizeHtml/constants";
import { sanitizeHtml } from "#src/services/sanitizeHtml/sanitizeHtml";

const COLOR_REGEXES = [/^#[\da-fA-F]{3,8}$/u, /^rgba?\(\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[\d.]+)?\)$/u, /^[a-z]+$/iu];

export const sanitizeTextHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedAttributes: {
      input: ["checked", "disabled", "type"],
      li: ["data-checked", "data-type"],
      span: [
        CUSTOM_EMOJI_ID_ATTRIBUTE,
        CUSTOM_EMOJI_NAME_ATTRIBUTE,
        MENTION_ID_ATTRIBUTE,
        MENTION_ITEM_TYPE_ATTRIBUTE,
        MENTION_LABEL_ATTRIBUTE,
        MENTION_TYPE_ATTRIBUTE,
        SPOILER_ATTRIBUTE,
        "style",
      ],
      ul: ["data-type"],
    },
    // A class reaches the app's own stylesheet, so an arbitrary one would let markup borrow its utilities — a fixed,
    // Full-screen block among them. Only what the editor writes survives: a code block's language, and the
    // Highlighter's token classes
    allowedClasses: { code: ["language-*"], pre: ["language-*"], span: ["hljs*"] },
    allowedStyles: {
      span: {
        "background-color": COLOR_REGEXES,
        "border-radius": [/^[\d.]+(?<unit>px|em|rem|%)$/u],
        color: COLOR_REGEXES,
      },
    },
    allowedTags: [...DEFAULT_ALLOWED_TAGS, "input", "label"],
    transformAttributes: {
      // A task item's checkbox is the one input rendered HTML carries, and it renders read-only: whatever the markup
      // Asked for, what leaves here is a disabled checkbox keeping only whether it was ticked
      input: ({ checked }) => ({ ...(checked === undefined ? {} : { checked }), disabled: "", type: "checkbox" }),
    },
  });
