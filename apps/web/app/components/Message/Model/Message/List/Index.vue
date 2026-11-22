<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";

import { useDataStore } from "#src/store/message/data";
import { useRoomEmojiDialogStore } from "#src/store/message/room/emojiDialog";
import { useRoomStore } from "#src/store/message/room/index";
import { useScrollStore } from "#src/store/message/ui/scroll";
import { DEFAULT_PAGE_LIMIT } from "@esposter/db-schema";

const { readMessages, readMoreMessages, readMoreNewerMessages: baseReadMoreNewerMessages } = useReadMessages();
const { isError, isPending, refresh } = await readMessages();
const dataStore = useDataStore();
const { hasMore, items, previousCursor } = storeToRefs(dataStore);
const roomStore = useRoomStore();
const { currentRoom, currentRoomId } = storeToRefs(roomStore);
const roomEmojiDialogStore = useRoomEmojiDialogStore();
const { isCreateOpen } = storeToRefs(roomEmojiDialogStore);
const scrollStore = useScrollStore();
// The sentinel and the container are the store's: whether the reader is looking at the present is one fact, read
// By the jump-to-present affordance as much as by the anchoring below
const { bottomSentinel, isPinnedToBottom, isScrolling, messageContainerElement, tabStopMessage } =
  storeToRefs(scrollStore);
const { setFocusedMessage } = scrollStore;
const setBottomSentinel = (element: unknown) => {
  bottomSentinel.value = element instanceof HTMLDivElement ? element : null;
};
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
// The list is column-reversed and its items run newest first, so Up reads an older message and Down a newer one. Home
// Goes to the oldest loaded message and End to the newest, the ends a reader sees at the top and at the bottom
const onMessageListKeydown = useGridKeyboard<ClientMessage>({
  getCellSelector: ({ id }) => `[id="${id}"]`,
  getFocusedCell: () => tabStopMessage.value,
  getNextCell: (event, { id }) => {
    const index = items.value.findIndex((message) => message.id === id);
    switch (event.key) {
      case "ArrowDown":
        return index > 0 ? items.value[index - 1] : undefined;
      case "ArrowUp":
        return items.value[index + 1];
      case "End":
        return items.value.at(0);
      case "Home":
        return items.value.at(-1);
      default:
        return undefined;
    }
  },
  root: messageContainerElement,
  setFocusedCell: setFocusedMessage,
});
</script>

<template>
  <MessageModelMessageConfirmDeleteDialog />
  <MessageModelMessageFileViewerDialog />
  <MessageModelMessageFileConfirmDeleteDialog />
  <MessageModelMessageLinkPreviewConfirmRemoveDialog />
  <MessageModelRoomEmojiCreateDialog v-model="isCreateOpen" :room-id="currentRoomId" />
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
    @keydown="onMessageListKeydown($event)"
  >
    <div :ref="setBottomSentinel" />
    <template v-if="isPending">
      <MessageModelMessageListSkeletonItem v-for="index in DEFAULT_PAGE_LIMIT" :key="index" />
    </template>
    <!-- Only a read that settled with nothing is a new room: a failed one says so, and tries again -->
    <UiErrorState v-else-if="isError" error="The messages could not be loaded." @retry="refresh()" />
    <MessageContentRoomWelcome v-else-if="items.length === 0 && currentRoom" :room="currentRoom" />
    <template v-else>
      <StyledWaypoint :is-active="Boolean(previousCursor)" @change="(onComplete) => readMoreNewerMessages(onComplete)">
        <MessageModelMessageListSkeletonItem v-for="index in DEFAULT_PAGE_LIMIT" :key="index" />
      </StyledWaypoint>
      <MessageModelMessageListContainer />
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreMessages(onComplete)">
        <MessageModelMessageListSkeletonItem v-for="index in DEFAULT_PAGE_LIMIT" :key="index" />
      </StyledWaypoint>
    </template>
  </div>
</template>
