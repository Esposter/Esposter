import type { SuggestionKeyDownProps, SuggestionOptions } from "@tiptap/suggestion";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { updatePosition } from "@/services/message/updatePosition";
import { getResultAsync, noop } from "@esposter/shared";
import { VueRenderer } from "@tiptap/vue-3";

interface SuggestionList {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export const getRender =
  <TItem, TAsync = TItem>(ListComponent: Component): NonNullable<SuggestionOptions<TItem, TAsync>["render"]> =>
  () => {
    let component: undefined | VueRenderer;

    return {
      onExit: () => {
        component?.element?.remove();
        component?.destroy();
      },

      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === "Escape") {
          component?.destroy();
          return true;
        }

        if (!component) return false;

        return (component.ref as SuggestionList).onKeyDown(props);
      },

      onStart: getSynchronizedFunction((props) =>
        getResultAsync(async () => {
          component = new VueRenderer(ListComponent, { editor: props.editor, props });

          if (!(props.clientRect && component.element)) return;

          const element = component.element as HTMLElement;
          element.style.position = "absolute";
          window.document.body.appendChild(element);
          await updatePosition(props.editor, element);
        }).match(noop, console.error),
      ),

      onUpdate: getSynchronizedFunction((props) =>
        getResultAsync(async () => {
          component?.updateProps(props);

          if (!(props.clientRect && component?.element)) return;

          const element = component.element as HTMLElement;
          await updatePosition(props.editor, element);
        }).match(noop, console.error),
      ),
    };
  };
