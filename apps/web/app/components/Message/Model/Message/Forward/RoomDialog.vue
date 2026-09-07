<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
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
  (query, cursor, opts) => {
    const normalizedSearchQuery = normalizeString(query);
    return $trpc.room.readRooms.query(
      {
        cursor,
        filter: normalizedSearchQuery ? { name: normalizedSearchQuery } : undefined,
      },
      opts,
    );
  },
  true,
  true,
);
</script>

<template>
  <v-dialog v-if="forward && creator" v-model="isOpen">
    <StyledCard>
      <v-card-title flex flex-col>
        <div flex items-center justify-between>
          Forward To
          <StyledTooltipIconButton
            icon="mdi-close"
            text="Close"
            :button-props="{ density: 'comfortable' }"
            @click="isOpen = false"
          />
        </div>
        <div pb-2 op-medium-emphasis text-title-small>Select where you want to share this message.</div>
        <v-text-field v-model="searchQuery" append-inner-icon="mdi-magnify" density="compact" placeholder="Search" />
      </v-card-title>
      <v-card-text p-4 overflow-y-auto>
        <v-list py-0>
          <MessageModelMessageForwardRoomListItem v-for="room of rooms" :key="room.id" :room />
          <StyledWaypoint :is-active="hasMore" @change="readMoreSearchedItems">
            <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
          </StyledWaypoint>
        </v-list>
      </v-card-text>
      <v-divider />
      <component :is="MessageComponentMap[forward.type]" :creator :message="forward" is-preview />
      <v-divider />
      <v-card-actions flex-col gap-0>
        <RichTextEditor v-model="messageInput" :limit="MESSAGE_MAX_LENGTH" placeholder="Add an optional message..." />
        <MessageModelMessageForwardSendButton :forward />
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
