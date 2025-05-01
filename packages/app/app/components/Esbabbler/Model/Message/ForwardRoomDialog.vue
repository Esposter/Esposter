<script setup lang="ts">
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { dayjs } from "#shared/services/dayjs";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";

const { $trpc } = useNuxtApp();
const messageStore = useMessageStore();
const { messages } = storeToRefs(messageStore);
const messageInputStore = useMessageInputStore();
const { forwardRoomIds, forwardRowKey } = storeToRefs(messageInputStore);
const forward = computed(() => messages.value.find(({ rowKey }) => rowKey === forwardRowKey.value));
const dialog = computed({
  get: () => Boolean(forwardRowKey.value),
  set: (newDialog) => {
    if (newDialog) return;
    forwardRowKey.value = undefined;
  },
});
const { hasMoreRoomsSearched, readMoreRoomsSearched, roomSearchQuery, roomsSearched } = useSearcher(
  (searchQuery, cursor) =>
    $trpc.room.readRooms.query({
      cursor,
      filter: { name: searchQuery },
    }),
  DatabaseEntityType.Room,
  true,
);

watch(dialog, (newDialog) => {
  if (newDialog) return;
  useTimeoutFn(() => {
    roomSearchQuery.value = "";
    forwardRoomIds.value = [];
  }, dayjs.duration(0.3, "seconds").asMilliseconds());
});
</script>

<template>
  <v-dialog v-model="dialog">
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
      <v-card-text p-4="!" overflow-y="auto">
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
      <v-card-actions>
        <StyledButton
          :disabled="forwardRoomIds.length === 0"
          @click="
            async () => {
              if (!forward) return;
              const { partitionKey, rowKey } = forward;
              await $trpc.message.forwardMessages.mutate({ partitionKey, rowKey, forwardRoomIds });
              dialog = false;
            }
          "
        >
          Send
        </StyledButton>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
