import { MentionSuggestion } from "@/services/message/MentionSuggestion";
import { MENTION_ITEM_TYPE_ATTRIBUTE } from "@esposter/shared";
import { Mention } from "@tiptap/extension-mention";

const MentionWithType = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: null,
        parseHTML: (element) => element.getAttribute(MENTION_ITEM_TYPE_ATTRIBUTE),
        renderHTML: (attributes) => (attributes.type ? { [MENTION_ITEM_TYPE_ATTRIBUTE]: attributes.type } : {}),
      },
    };
  },
});

// Drawn in the tokens rather than their values, so a mention follows the theme it is read in
export const MentionExtension = MentionWithType.configure({
  HTMLAttributes: {
    style:
      "color:var(--ui-info);background-color:color-mix(in srgb,var(--ui-info) 10%,transparent);border-radius:.25rem",
  },
  suggestion: MentionSuggestion,
});
