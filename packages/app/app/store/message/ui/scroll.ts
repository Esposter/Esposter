import type { VList } from "vuetify/components";

import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { RoutePath } from "@esposter/shared";

export const useScrollStore = defineStore("message/ui/scroll", () => {
  const messageContainer = ref<InstanceType<typeof VList> | null>(null);
  const messageContainerElement = computed(() => messageContainer.value?.$el as HTMLDivElement | null);
  const { isScrolling } = useScroll(messageContainerElement);
  const bottomSentinel = ref<HTMLDivElement | null>(null);
  // Where the reader is, observed rather than measured. An IntersectionObserver re-observes and reports the moment
  // Its target or root changes, so a list that remounts — a room switch, the jump back to the present — answers
  // For the list on screen. A scroll offset moves only on a scroll event, so it keeps answering for the list that
  // Was torn down until the reader scrolls the new one, which is what left the affordance up after a jump had
  // Already reached the present. Both observers start pinned: one reports a frame after it is created, and
  // Defaulting to "away from the present" flashes the affordance over every room the reader opens
  const isPinnedToBottom = useElementVisibility(bottomSentinel, {
    initialValue: true,
    scrollTarget: messageContainerElement,
  });
  const { height: messageContainerHeight } = useElementSize(messageContainerElement);
  // The affordance answers to a screenful rather than to the bottom edge, which is how every chat client the
  // Reader already knows behaves: a wheel notch off the newest message is still reading the present, a screen back
  // Is browsing history. The threshold is the reader's own viewport, so there is no tuned number to get wrong on a
  // Phone or on a tall monitor. The anchoring class keeps the strict edge instead, because it may only be disabled
  // While the list is genuinely at the bottom — half a screen up, it is the browser's own anchoring that holds the
  // Reader's place as a message arrives
  const isNearPresent = useElementVisibility(bottomSentinel, {
    initialValue: true,
    rootMargin: computed(() => `0px 0px ${messageContainerHeight.value}px 0px`),
    scrollTarget: messageContainerElement,
  });
  const dataStore = useDataStore();
  // Two independent ways to be out of the present, and the affordance owes both: the reader has scrolled a screen
  // Back from the newest loaded message, or the loaded window is not the live tail at all — a deep link opens the
  // Room around one older message and leaves the newer ones unloaded, so the bottom of that window is still the
  // Past. Nothing loaded yet is neither: there is no present to jump to until the first page lands
  const isViewingOlderMessages = computed(
    () => dataStore.items.length > 0 && (!isNearPresent.value || dataStore.hasMoreNewer),
  );
  const activeRowKey = ref("");
  const roomStore = useRoomStore();
  const { start: startClearActiveRowKey } = useTimeoutFn(
    () => {
      activeRowKey.value = "";
    },
    Temporal.Duration.from({ seconds: 2 }).total("milliseconds"),
    { immediate: false },
  );
  const jumpToPresent = async () => {
    const roomId = roomStore.currentRoomId;
    if (!roomId) return;
    // Scrolling cannot reach messages that were never loaded, so a window that is not the tail is re-read rather
    // Than scrolled: the room's own route reads the newest page by definition, and a newer cursor is only ever
    // Left behind by the permalink route it navigates away from
    else if (dataStore.hasMoreNewer) await navigateTo(RoutePath.Messages(roomId));
    // The list is column-reversed, so its scroll origin is the newest message
    else if (messageContainerElement.value) messageContainerElement.value.scrollTop = 0;
  };
  const setActiveRowKey = (rowKey: string) => {
    activeRowKey.value = rowKey;
    startClearActiveRowKey();
  };
  return {
    activeRowKey,
    bottomSentinel,
    isPinnedToBottom,
    isScrolling,
    isViewingOlderMessages,
    jumpToPresent,
    messageContainer,
    messageContainerElement,
    setActiveRowKey,
  };
});
