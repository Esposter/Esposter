import type { MentionNodeAttributes } from "@/models/message/MentionNodeAttributes";
import type { User } from "@esposter/db-schema";
import type { VirtualElement } from "@floating-ui/dom";
import type { MentionOptions } from "@tiptap/extension-mention";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import MentionList from "@/components/Message/Model/Message/MentionList.vue";
import { useRoomStore } from "@/store/message/room";
import { computePosition, flip, shift } from "@floating-ui/dom";
import { Editor } from "@tiptap/core";
import { posToDOMRect, VueRenderer } from "@tiptap/vue-3";

type Suggestion = MentionOptions<User, MentionNodeAttributes>["suggestion"];

const updatePosition = async (editor: Editor, element: HTMLElement) => {
  const virtualElement: VirtualElement = {
    getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  };
  const { strategy, x, y } = await computePosition(virtualElement, element, {
    middleware: [shift(), flip()],
    placement: "bottom-start",
    strategy: "absolute",
  });
  element.style.width = "max-content";
  element.style.position = strategy;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.style.zIndex = "9999";
};

export const suggestion: Suggestion = {
  items: async ({ query }) => {
    const roomStore = useRoomStore();
    const { currentRoomId } = storeToRefs(roomStore);
    if (!currentRoomId.value) return [];

    const { $trpc } = useNuxtApp();
    const { items } = await $trpc.room.readMembers.query({
      filter: query ? { name: query } : undefined,
      roomId: currentRoomId.value,
    });
    return items;
  },
  render: () => {
    let component: undefined | VueRenderer;

    return {
      onExit: () => {
        component?.element?.remove();
        component?.destroy();
      },

      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          component?.destroy();
          return true;
        }

        if (!component) return false;

        return Boolean((component.ref as InstanceType<typeof MentionList>).onKeyDown(props));
      },

      onStart: getSynchronizedFunction(async (props) => {
        component = new VueRenderer(MentionList, { editor: props.editor, props });

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
  },
};
