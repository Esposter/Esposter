import {
  CUSTOM_EMOJI_ID_ATTRIBUTE,
  CUSTOM_EMOJI_NAME_ATTRIBUTE,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_LABEL_ATTRIBUTE,
  MENTION_TYPE_ATTRIBUTE,
  SPOILER_ATTRIBUTE,
} from "#src/services/message/constants";
import type { TextHtmlAllowance } from "#src/models/sanitizeHtml/TextHtmlAllowance";

import { DEFAULT_ALLOWED_TAGS } from "#src/services/sanitizeHtml/constants";
import { sanitizeHtml } from "#src/services/sanitizeHtml/sanitizeHtml";

const COLOR_REGEXES = [/^#[\da-fA-F]{3,8}$/u, /^rgba?\(\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[\d.]+)?\)$/u, /^[a-z]+$/iu];

// The allowance is a caller's own additions: the message composer passes none, and a note passes the one image shape
// Its published view may show. It can add tags and attributes but cannot change the writing kit's own list
export const sanitizeTextHtml = (html: string, allowance: TextHtmlAllowance = {}): string =>
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
      ...allowance.allowedAttributes,
    },
    allowedSources: allowance.allowedSources,
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
    allowedTags: [...DEFAULT_ALLOWED_TAGS, "input", "label", ...(allowance.allowedTags ?? [])],
    transformAttributes: {
      // A task item's checkbox is the one input rendered HTML carries, and it renders read-only: whatever the markup
      // Asked for, what leaves here is a disabled checkbox keeping only whether it was ticked
      input: ({ checked }) => ({ ...(checked === undefined ? {} : { checked }), disabled: "", type: "checkbox" }),
    },
  });
