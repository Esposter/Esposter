<script setup lang="ts">
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { RoutePath } from "#shared/models/router/RoutePath";
import { MESSAGE_MAX_LENGTH } from "#shared/services/message/constants";
import { useAlertStore } from "@/store/alert";
import { useMessageStore } from "@/store/message";
import { useDataStore } from "@/store/message/data";
import { useForwardStore } from "@/store/message/forward";

const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const messageStore = useMessageStore();
const { userMap } = storeToRefs(messageStore);
const dataStore = useDataStore();
const { messages } = storeToRefs(dataStore);
const forwardStore = useForwardStore();
const { messageInput, roomIds, rowKey } = storeToRefs(forwardStore);
const forward = computed(() => messages.value.find((m) => m.rowKey === rowKey.value));
const creator = computed(() => (forward.value ? userMap.value.get(forward.value.userId) : undefined));
const dialog = computed({
  get: () => Boolean(rowKey.value),
  set: (newDialog) => {
    if (newDialog) return;
    rowKey.value = "";
  },
});
const { hasMoreRoomsSearched, readMoreRoomsSearched, roomSearchQuery, roomsSearched } = useCursorSearcher(
  (searchQuery, cursor) =>
    $trpc.room.readRooms.query({
      cursor,
      filter: { name: searchQuery },
    }),
  DatabaseEntityType.Room,
  true,
);
</script>

<template>
  <v-dialog v-if="forward && creator" v-model="dialog">
    <StyledCard>
      <v-card-title flex flex-col>
        <div flex justify-between items-center>
          Forward To
          <v-btn icon="mdi-close" density="comfortable" @click="dialog = false" />
        </div>
        <div class="text-subtitle-2" text-gray pb-2>Select where you want to share this message.</div>
        <v-text-field
          v-model="roomSearchQuery"
          placeholder="Search"
          append-inner-icon="mdi-magnify"
          density="compact"
          hide-details
        />
      </v-card-title>
      <v-card-text p-4="!" overflow-y-auto>
        <v-list py-0>
          <EsbabblerModelMessageForwardRoomListItem
            v-for="roomSearched of roomsSearched"
            :key="roomSearched.id"
            :room="roomSearched"
          />
          <StyledWaypoint :active="hasMoreRoomsSearched" @change="readMoreRoomsSearched" />
        </v-list>
      </v-card-text>
      <v-divider />
      <EsbabblerModelMessage :creator :message="forward" is-preview />
      <v-divider />
      <v-card-actions flex-col gap-0>
        <RichTextEditor v-model="messageInput" :limit="MESSAGE_MAX_LENGTH" placeholder="Add an optional message..." />
        <StyledButton
          w-full
          :disabled="roomIds.length === 0"
          @click="
            async () => {
              if (!forward) return;
              const { partitionKey, rowKey } = forward;
              await $trpc.message.forwardMessage.mutate({ partitionKey, rowKey, roomIds, message: messageInput });
              if (roomIds.length === 1) {
                await navigateTo(RoutePath.Messages(roomIds[0]));
                createAlert('Message forwarded!', 'success', { location: 'top center', icon: 'mdi-share' });
              }
              dialog = false;
              roomSearchQuery = '';
              roomIds = [];
              messageInput = '';
            }
          "
        >
          Send {{ roomIds.length > 1 ? `(${roomIds.length})` : "" }}
        </StyledButton>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
