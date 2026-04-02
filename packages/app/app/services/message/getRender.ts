import type { SuggestionKeyDownProps } from "@tiptap/suggestion";
import type { Component } from "vue";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { updatePosition } from "@/services/message/updatePosition";
import { VueRenderer } from "@tiptap/vue-3";

interface SuggestionList {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export const getRender = (ListComponent: Component) => () => {
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

      return Boolean((component.ref as SuggestionList).onKeyDown(props));
    },

    onStart: getSynchronizedFunction(async (props) => {
      component = new VueRenderer(ListComponent, { editor: props.editor, props });

      if (!(props.clientRect && component.element)) return;

      const element = component.element as HTMLElement;
      element.style.position = "absolute";
      document.body.appendChild(element);
      await updatePosition(props.editor, element);
    }),

    onUpdate: getSynchronizedFunction(async (props) => {
      component?.updateProps(props);

      if (!(props.clientRect && component?.element)) return;

      const element = component.element as HTMLElement;
      await updatePosition(props.editor, element);
    }),
  };
};
