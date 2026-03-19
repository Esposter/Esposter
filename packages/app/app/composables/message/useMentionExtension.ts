import { useColorsStore } from "@/store/colors";
import { suggestion } from "@/services/message/suggestion";
import { Mention } from "@tiptap/extension-mention";

export const useMentionExtension = () => {
  const colorsStore = useColorsStore();
  const { info, infoOpacity10 } = storeToRefs(colorsStore);
  return computed(() =>
    Mention.configure({
      HTMLAttributes: {
        style: `color:${info.value};background-color:${infoOpacity10.value};border-radius:.25rem`,
      },
      suggestion,
    }),
  );
};
