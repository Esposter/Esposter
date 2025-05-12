<script setup lang="ts">
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { RoutePath } from "#shared/models/router/RoutePath";
import { dayjs } from "#shared/services/dayjs";
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { useEsbabblerStore } from "@/store/esbabbler";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";

const { $trpc } = useNuxtApp();
const esbabblerStore = useEsbabblerStore();
const { userMap } = storeToRefs(esbabblerStore);
const messageStore = useMessageStore();
const { messages } = storeToRefs(messageStore);
const messageInputStore = useMessageInputStore();
const { forwardRoomIds, forwardRowKey } = storeToRefs(messageInputStore);
const forward = computed(() => messages.value.find(({ rowKey }) => rowKey === forwardRowKey.value));
const creator = computed(() => (forward.value ? userMap.value.get(forward.value.userId) : undefined));
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
const message = ref("");

watch(dialog, (newDialog) => {
  if (newDialog) return;
  useTimeoutFn(() => {
    roomSearchQuery.value = "";
    forwardRoomIds.value = [];
  }, dayjs.duration(0.3, "seconds").asMilliseconds());
});
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
      <EsbabblerModelMessage :creator is-preview :message="forward" />
      <v-divider />
      <v-card-actions flex-col gap-0>
        <RichTextEditor v-model="message" :limit="MESSAGE_MAX_LENGTH" placeholder="Add an optional message..." />
        <StyledButton
          w-full
          :disabled="forwardRoomIds.length === 0"
          @click="
            async () => {
              if (!forward) return;
              const { partitionKey, rowKey } = forward;
              await $trpc.message.forwardMessages.mutate({ partitionKey, rowKey, forwardRoomIds, message });
              if (forwardRoomIds.length === 1) {
                await navigateTo(RoutePath.Messages(forwardRoomIds[0]));
                useToast('Message forwarded!', {
                  position: 'top-center',
                  prependIcon: 'mdi-share',
                  prependIconProps: { color: 'success' },
                });
              }
              dialog = false;
            }
          "
        >
          Send {{ forwardRoomIds.length > 1 ? `(${forwardRoomIds.length})` : "" }}
        </StyledButton>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
