<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { useScrollStore } from "@/store/message/ui/scroll";

const { readMessages, readMoreMessages, readMoreNewerMessages: baseReadMoreNewerMessages } = useReadMessages();
const { isPending } = await readMessages();
const dataStore = useDataStore();
const { hasMore, hasMoreNewer, items } = storeToRefs(dataStore);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const scrollStore = useScrollStore();
const { isScrolling, messageContainer, messageContainerElement } = storeToRefs(scrollStore);
const bottomSentinel = useTemplateRef("bottomSentinel");
const isPinnedToBottom = useElementVisibility(bottomSentinel, { scrollTarget: messageContainerElement });
const getFirstVisibleMessageElement = () => {
  const element = messageContainerElement.value;
  if (!element) return undefined;
  // Anchor to a real visible message, not scrollHeight: column-reverse height deltas are easy to get subtly wrong.
  const { bottom: containerBottom, top: containerTop } = element.getBoundingClientRect();
  return [...element.querySelectorAll("[id]")].find((messageElement) => {
    const { bottom, top } = messageElement.getBoundingClientRect();
    return top < containerBottom && bottom > containerTop;
  });
};
const readMoreNewerMessages = async (onComplete: () => void) => {
  const firstVisibleMessageElement = getFirstVisibleMessageElement();
  const top = firstVisibleMessageElement?.getBoundingClientRect().top;
  await baseReadMoreNewerMessages(async () => {
    await nextTick();
    window.requestAnimationFrame(() => {
      const element = messageContainerElement.value;
      if (top !== undefined && firstVisibleMessageElement && element && !isScrolling.value) {
        // Newer messages insert before the anchor, so compensate by how far it moved after Vue rendered.
        const currentFirstVisibleMessageElement = window.document.getElementById(firstVisibleMessageElement.id);
        if (currentFirstVisibleMessageElement)
          element.scrollTop += currentFirstVisibleMessageElement.getBoundingClientRect().top - top;
      }
      onComplete();
    });
  });
};
</script>

<template>
  <v-list
    ref="messageContainer"
    :class="{ 'overflow-anchor-none': isPinnedToBottom }"
    pb-0
    flex
    flex-1
    basis-full
    flex-col-reverse
    overflow-x-hidden
    overflow-y-auto
    lines="two"
  >
    <div ref="bottomSentinel" />
    <template v-if="isPending">
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else-if="items.length === 0 && currentRoom">
      <MessageContentRoomWelcome :room="currentRoom" />
    </template>
    <template v-else>
      <StyledWaypoint :is-active="hasMoreNewer" @change="readMoreNewerMessages">
        <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
      <MessageModelMessageListContainer />
      <StyledWaypoint :is-active="hasMore" @change="readMoreMessages">
        <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
