import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";

import { useRichTextSuggestionStore } from "@/store/richTextEditor/suggestion";

// What the suggestion plugin reports is written to the one suggestion the editor draws, rather than a list mounted by
// Hand on the body, where no theme scope reached it
export const getRender =
  <TItem, TAsync = TItem>(ListComponent: Component): NonNullable<SuggestionOptions<TItem, TAsync>["render"]> =>
  () => {
    const richTextSuggestionStore = useRichTextSuggestionStore();
    const { list, suggestion } = storeToRefs(richTextSuggestionStore);
    const show = ({ clientRect, editor, ...props }: SuggestionProps<TItem, TAsync>) => {
      suggestion.value = {
        component: markRaw(ListComponent),
        editor,
        getRect: () => clientRect?.() ?? undefined,
        props: { ...props, editor },
      };
    };
    return {
      onExit: () => {
        suggestion.value = undefined;
        list.value = undefined;
      },
      onKeyDown: (props) => {
        if (props.event.key !== "Escape") return list.value?.onKeyDown(props) ?? false;
        suggestion.value = undefined;
        return true;
      },
      onStart: show,
      onUpdate: show,
    };
  };
