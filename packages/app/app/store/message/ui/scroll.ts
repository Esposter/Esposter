import type { VList } from "vuetify/components";

import { dayjs } from "#shared/services/dayjs";
import { useRoomStore } from "@/store/message/room";
import { RoutePath } from "@esposter/shared";

// How far back up the reversed message list counts as having left the present — the jump-to-present affordance
// Appears past this point rather than on any scroll at all. The list grows upwards, so its scroll offset is
// Negative.
const VIEWING_OLDER_MESSAGES_SCROLL_OFFSET = -2000;

export const useScrollStore = defineStore("message/ui/scroll", () => {
  const route = useRoute();
  const messageContainer = ref<InstanceType<typeof VList> | null>(null);
  const messageContainerElement = computed(() => messageContainer.value?.$el as HTMLDivElement | null);
  const { isScrolling, y } = useScroll(messageContainerElement);
  const isViewingOlderMessages = computed(() => y.value < VIEWING_OLDER_MESSAGES_SCROLL_OFFSET);
  const activeRowKey = ref("");
  const roomStore = useRoomStore();
  const { start: startClearActiveRowKey } = useTimeoutFn(
    () => {
      activeRowKey.value = "";
    },
    dayjs.duration(2, "seconds").asMilliseconds(),
    { immediate: false },
  );
  const jumpToPresent = async () => {
    if (!roomStore.currentRoomId) return;
    else if (route.params.rowKey) await navigateTo(RoutePath.Messages(roomStore.currentRoomId));
    else if (messageContainerElement.value) messageContainerElement.value.scrollTop = 0;
  };
  const setActiveRowKey = (rowKey: string) => {
    activeRowKey.value = rowKey;
    startClearActiveRowKey();
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
