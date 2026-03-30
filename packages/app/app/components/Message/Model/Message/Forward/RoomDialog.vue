<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useAlertStore } from "@/store/alert";
import { useDataStore } from "@/store/message/data";
import { useForwardStore } from "@/store/message/forward";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { RoutePath, takeOne } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const forwardStore = useForwardStore();
const { messageInput, roomIds, rowKey } = storeToRefs(forwardStore);
const forward = computed(() => items.value.find((m) => m.rowKey === rowKey.value));
const creator = useCreator(forward);
const dialog = computed({
  get: () => Boolean(rowKey.value),
  set: (newDialog) => {
    if (newDialog) return;
    rowKey.value = "";
  },
});
const {
  hasMore,
  items: itemsSearched,
  readMoreItemsSearched,
  searchQuery,
} = useCursorSearcher(
  (searchQuery, cursor, opts) =>
    $trpc.room.readRooms.query(
      {
        cursor,
        filter: { name: searchQuery },
      },
      opts,
    ),
  true,
  true,
);
</script>

<template>
  <v-dialog v-if="forward && creator" v-model="dialog">
    <StyledCard>
      <v-card-title flex flex-col>
        <div flex justify-between items-center>
          Forward To
          <v-btn density="comfortable" icon="mdi-close" @click="dialog = false" />
        </div>
        <div class="text-title-small" text-gray pb-2>Select where you want to share this message.</div>
        <v-text-field
          v-model="searchQuery"
          append-inner-icon="mdi-magnify"
          density="compact"
          placeholder="Search"
          hide-details
        />
      </v-card-title>
      <v-card-text p-4 overflow-y-auto>
        <v-list py-0>
          <MessageModelMessageForwardRoomListItem v-for="room of itemsSearched" :key="room.id" :room />
          <StyledWaypoint :is-active="hasMore" @change="readMoreItemsSearched">
            <MessageModelRoomSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
          </StyledWaypoint>
        </v-list>
      </v-card-text>
      <v-divider />
      <MessageModelMessageType :creator :message="forward" is-preview />
      <v-divider />
      <v-card-actions flex-col gap-0>
        <RichTextEditor v-model="messageInput" :limit="MESSAGE_MAX_LENGTH" placeholder="Add an optional message..." />
        <StyledButton
          w-full
          :button-props="{
            disabled: roomIds.length === 0,
            text: `Send ${roomIds.length > 1 ? `(${roomIds.length})` : ''}`,
          }"
          @click="
            async () => {
              if (!forward) return;
              const { partitionKey, rowKey } = forward;
              await $trpc.message.forwardMessage.mutate({ partitionKey, rowKey, roomIds, message: messageInput });
              if (roomIds.length === 1) {
                await navigateTo(RoutePath.Messages(takeOne(roomIds)));
                createAlert('Message forwarded!', 'success', { location: 'top center', icon: 'mdi-share' });
              }
              dialog = false;
              searchQuery = '';
              roomIds = [];
              messageInput = '';
            }
          "
        />
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
