<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useAlertStore } from "@/store/alert";
import { useDataStore } from "@/store/message/data";
import { useForwardStore } from "@/store/message/input/forward";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { normalizeString, RoutePath, takeOne } from "@esposter/shared";

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
const executeMutation = useMutation();
// Forwarded messages land in the target rooms via the subscription echo — non-optimistic
const forwardMessage = async () => {
  if (!forward.value) return;
  const { partitionKey, rowKey: forwardRowKey } = forward.value;
  await executeMutation(
    () =>
      $trpc.message.forwardMessage.mutate({
        message: messageInput.value,
        partitionKey,
        roomIds: roomIds.value,
        rowKey: forwardRowKey,
      }),
    {
      onSuccess: async () => {
        if (roomIds.value.length === 1) {
          await navigateTo(RoutePath.Messages(takeOne(roomIds.value)));
          createAlert("Message forwarded!", "success", { icon: "mdi-share", location: "top center" });
        }
        dialog.value = false;
        searchQuery.value = "";
        roomIds.value = [];
        messageInput.value = "";
      },
    },
  );
};
</script>

<template>
  <v-dialog v-if="forward && creator" v-model="dialog">
    <StyledCard>
      <v-card-title flex flex-col>
        <div flex items-center justify-between>
          Forward To
          <v-btn density="comfortable" icon="mdi-close" @click="dialog = false" />
        </div>
        <div text-gray pb-2 text-title-small>Select where you want to share this message.</div>
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
      <component :is="MessageComponentMap[forward.type]" v-if="forward" :creator :message="forward" is-preview />
      <v-divider />
      <v-card-actions flex-col gap-0>
        <RichTextEditor v-model="messageInput" :limit="MESSAGE_MAX_LENGTH" placeholder="Add an optional message..." />
        <StyledButton
          w-full
          :button-props="{
            disabled: roomIds.length === 0,
            text: `Send ${roomIds.length > 1 ? `(${roomIds.length})` : ''}`,
          }"
          @click="forwardMessage"
        />
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
