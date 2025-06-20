import type { User } from "#shared/db/schema/users";
import type { MentionNodeAttributes } from "@/models/esbabbler/MentionNodeAttributes";
import type { MentionOptions } from "@tiptap/extension-mention";
import type { Instance } from "tippy.js";

import { dayjs } from "#shared/services/dayjs";
import MentionList from "@/components/Esbabbler/Model/Message/MentionList.vue";
import { useRoomStore } from "@/store/esbabbler/room";
import { VueRenderer } from "@tiptap/vue-3";
import tippy from "tippy.js";

type Suggestion = MentionOptions<User, MentionNodeAttributes>["suggestion"];

export const suggestion: Suggestion = {
  items: useDebounceFn<NonNullable<Suggestion["items"]>>(async ({ query }) => {
    const roomStore = useRoomStore();
    const { currentRoomId } = storeToRefs(roomStore);
    if (!currentRoomId.value) return [];

    const { $trpc } = useNuxtApp();
    const { items } = await $trpc.room.readMembers.query({
      filter: query ? { name: query } : undefined,
      roomId: currentRoomId.value,
    });
    return items;
  }, dayjs.duration(0.3, "seconds").asMilliseconds()),
  render: () => {
    let component: VueRenderer;
    let popup: Instance[];

    return {
      onExit() {
        popup[0].destroy();
        component.destroy();
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }

        return Boolean((component.ref as InstanceType<typeof MentionList>).onKeyDown(props));
      },

      onStart: (props) => {
        component = new VueRenderer(MentionList as Component, { editor: props.editor, props });

        if (!props.clientRect) return;

        popup = tippy("body", {
          appendTo: () => document.body,
          content: component.element ?? undefined,
          getReferenceClientRect: props.clientRect as () => DOMRect,
          interactive: true,
          placement: "top-start",
          showOnCreate: true,
          trigger: "manual",
        });
      },

      onUpdate(props) {
        component.updateProps(props);

        if (!props.clientRect) return;

        popup[0].setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        });
      },
    };
  },
};
