import type { VList } from "vuetify/components";

import { useRoomStore } from "@/store/message/room";
import { RoutePath } from "@esposter/shared";

export const useScrollStore = defineStore("message/scroll", () => {
  const messageContainer = ref<InstanceType<typeof VList> | null>(null);
  const messageContainerElement = computed(() => messageContainer.value?.$el as HTMLDivElement | null);
  const { isScrolling, y } = useScroll(messageContainerElement);
  const isViewingOlderMessages = computed(() => y.value < -2000);
  const roomStore = useRoomStore();
  // We're gonna cheat here and just send them to the messages page C:
  const jumpToPresent = async () => {
    if (!roomStore.currentRoomId) return;
    await navigateTo(RoutePath.Messages(roomStore.currentRoomId));
  };
  return {
    isScrolling,
    isViewingOlderMessages,
    jumpToPresent,
    messageContainer,
    messageContainerElement,
  };
});
