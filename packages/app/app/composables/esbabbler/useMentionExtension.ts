import { suggestion } from "@/services/esbabbler/suggestion";
import Mention from "@tiptap/extension-mention";

export const useMentionExtension = () => {
  const { info, infoOpacity10 } = useColors();
  return computed(() =>
    Mention.configure({
      HTMLAttributes: {
        style: `color:${info.value};background-color:${infoOpacity10.value};border-radius:.25rem`,
      },
      suggestion,
    }),
  );
};
