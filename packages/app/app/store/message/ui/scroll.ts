import type { VList } from "vuetify/components";

import { dayjs } from "#shared/services/dayjs";
import { useRoomStore } from "@/store/message/room";
import { RoutePath } from "@esposter/shared";

export const useScrollStore = defineStore("message/ui/scroll", () => {
  const route = useRoute();
  const messageContainer = ref<InstanceType<typeof VList> | null>(null);
  const messageContainerElement = computed(() => messageContainer.value?.$el as HTMLDivElement | null);
  const { isScrolling, y } = useScroll(messageContainerElement);
  const isViewingOlderMessages = computed(() => y.value < -2000);
  const activeRowKey = ref("");
  const roomStore = useRoomStore();
  const jumpToPresent = async () => {
    if (!roomStore.currentRoomId) return;
    else if (route.params.rowKey) await navigateTo(RoutePath.Messages(roomStore.currentRoomId));
    else if (messageContainerElement.value) messageContainerElement.value.scrollTop = 0;
  };
  const setActiveRowKey = (rowKey: string) => {
    activeRowKey.value = rowKey;
    useTimeoutFn(() => {
      activeRowKey.value = "";
    }, dayjs.duration(2, "seconds").asMilliseconds());
  };
  return {
    activeRowKey,
    isScrolling,
    isViewingOlderMessages,
    jumpToPresent,
    messageContainer,
    messageContainerElement,
    setActiveRowKey,
  };
});
