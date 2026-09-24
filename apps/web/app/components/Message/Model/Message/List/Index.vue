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
// The sentinel and the container are the store's: whether the reader is looking at the present is one fact, read
// By the jump-to-present affordance as much as by the anchoring below
const { bottomSentinel, isPinnedToBottom, isScrolling, messageContainerElement } = storeToRefs(scrollStore);
const getFirstVisibleMessageElement = () => {
  const element = messageContainerElement.value;
  if (!element) return undefined;
  // Anchor to a real visible message, not scrollHeight: column-reverse height deltas are easy to get subtly wrong.
  const { bottom: containerBottom, top: containerTop } = element.getBoundingClientRect();
  for (const messageElement of element.querySelectorAll("[id]")) {
    const { bottom, top } = messageElement.getBoundingClientRect();
    if (top < containerBottom && bottom > containerTop) return messageElement;
  }

  return undefined;
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
  <MessageModelMessageConfirmDeleteDialog />
  <MessageModelMessageFileViewerDialog />
  <MessageModelMessageConfirmPinDialog />
  <MessageModelMessageReactionsDialog />
  <div
    ref="messageContainerElement"
    :class="{ 'of-anchor-none': isPinnedToBottom }"
    pb-2
    flex
    flex-1
    basis-full
    flex-col-reverse
    of-x-hidden
    of-y-auto
    ui-body
  >
    <div ref="bottomSentinel" />
    <template v-if="isPending">
      <MessageModelMessageListSkeletonItem v-for="index in DEFAULT_READ_LIMIT" :key="index" />
    </template>
    <MessageContentRoomWelcome v-else-if="items.length === 0 && currentRoom" :room="currentRoom" />
    <template v-else>
      <StyledWaypoint :is-active="hasMoreNewer" @change="readMoreNewerMessages">
        <MessageModelMessageListSkeletonItem v-for="index in DEFAULT_READ_LIMIT" :key="index" />
      </StyledWaypoint>
      <MessageModelMessageListContainer />
      <StyledWaypoint :is-active="hasMore" @change="readMoreMessages">
        <MessageModelMessageListSkeletonItem v-for="index in DEFAULT_READ_LIMIT" :key="index" />
      </StyledWaypoint>
    </template>
  </div>
</template>
