import { MentionSuggestion } from "@/services/message/MentionSuggestion";
import { useColorsStore } from "@/store/colors";
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

export const useMentionExtension = () => {
  const colorsStore = useColorsStore();
  const { info, "info-opacity-10": infoOpacity10 } = storeToRefs(colorsStore);
  return computed(() =>
    MentionWithType.configure({
      HTMLAttributes: {
        style: `color:${info.value};background-color:${infoOpacity10.value};border-radius:.25rem`,
      },
      suggestion: MentionSuggestion,
    }),
  );
};
