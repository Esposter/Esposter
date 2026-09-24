<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useDataStore } from "@/store/message/data";
import { useForwardStore } from "@/store/message/input/forward";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const forwardStore = useForwardStore();
const { messageInput, rowKey } = storeToRefs(forwardStore);
const { isOpen, item: forward } = useSingletonDialog(rowKey, () =>
  items.value.find((message) => message.rowKey === rowKey.value),
);
const creator = useCreator(forward);
const {
  hasMore,
  items: rooms,
  readMoreSearchedItems,
  searchQuery,
} = useCursorSearcher(
  (query, cursor, options) => {
    const normalizedSearchQuery = normalizeString(query);
    return $trpc.room.readRooms.query(
      { cursor, filter: normalizedSearchQuery ? { name: normalizedSearchQuery } : undefined },
      options,
    );
  },
  true,
  true,
);
</script>

<template>
  <!-- High, as a dialog whose list changes length under its search stands, so the field never moves -->
  <UiDialog v-if="forward && creator" v-model="isOpen" title="Forward To" w="[min(36rem,90vw)]">
    <div p-3 flex flex-col gap-3 min-h-0 of-y-auto>
      <p text-muted>Select where you want to share this message.</p>
      <UiTextField v-model="searchQuery" label="Search rooms" :type="UiTextFieldType.Search" />
      <div aria-label="Rooms" role="list" flex flex-col max-h="[30dvh]" of-y-auto>
        <div v-for="room of rooms" :key="room.id" role="listitem">
          <MessageModelMessageForwardRoomListItem :room />
        </div>
        <StyledWaypoint :is-active="hasMore" @change="readMoreSearchedItems">
          <div v-for="index in DEFAULT_READ_LIMIT" :key="index" ui-row>
            <UiSkeleton size-6 />
            <UiSkeleton flex-1 h-4 />
          </div>
        </StyledWaypoint>
      </div>
      <div py-2 ui-frame>
        <component :is="MessageComponentMap[forward.type]" :creator :message="forward" is-preview />
      </div>
      <RichTextEditor v-model="messageInput" :limit="MESSAGE_MAX_LENGTH" placeholder="Add an optional message..." />
    </div>
    <footer p-3 flex gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <MessageModelMessageForwardSendButton :forward />
    </footer>
  </UiDialog>
</template>
