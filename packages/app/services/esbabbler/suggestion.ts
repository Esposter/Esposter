import type { OnKeyDown } from "@/components/Esbabbler/Model/Message/MentionList.vue";
import MentionList from "@/components/Esbabbler/Model/Message/MentionList.vue";
import { useRoomStore } from "@/store/esbabbler/room";
import type { MentionOptions } from "@tiptap/extension-mention";
import { VueRenderer } from "@tiptap/vue-3";
import type { Instance } from "tippy.js";
import tippy from "tippy.js";

export const suggestion: MentionOptions["suggestion"] = {
  items: async ({ query }) => {
    const roomStore = useRoomStore();
    const { currentRoomId } = storeToRefs(roomStore);
    if (!(currentRoomId.value && query)) return [];

    const { $client } = useNuxtApp();
    const { items } = await $client.room.readMembers.query({ roomId: currentRoomId.value, filter: { name: query } });
    return items;
  },

  render: () => {
    let component: VueRenderer;
    let popup: Instance[];

    return {
      onStart: (props) => {
        component = new VueRenderer(MentionList as Component, { props, editor: props.editor });

        if (!props.clientRect) return;

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "top-start",
        });
      },

      onUpdate(props) {
        component.updateProps(props);

        if (!props.clientRect) return;

        popup[0].setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }

        return Boolean((component.ref?.onKeyDown as OnKeyDown)(props));
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};