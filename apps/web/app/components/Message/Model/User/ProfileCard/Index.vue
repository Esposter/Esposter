<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useStatusStore } from "@/store/message/user/status";

interface Props {
  user: Pick<User, "id" | "image" | "name">;
}

const { user } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { data: session } = await authClient.useSession(useFetch);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
const statusStore = useStatusStore();
const { getStatusMessage, getUserStatus } = statusStore;
const isSelf = computed(() => session.value?.user.id === user.id);
// The row this card pops out of already shows the room nickname, so the card has to resolve the same way —
// Otherwise hovering a renamed member swaps the name out from under the cursor
const displayName = computed(() => getDisplayName(user, currentRoomId.value));
// The card is a popout that must appear the moment it is hovered, so the mutual rooms load behind it rather
// Than blocking setup — the section simply appears once they land
const { data: mutualRooms } = useQuery(() => $trpc.room.readMutualRooms.query({ userId: user.id }));
</script>

<template>
  <v-card min-w="16.25rem">
    <MessageModelUserProfileCardHeader :display-name :is-self :user>
      <template v-if="!isSelf" #actions>
        <MessageModelUserProfileCardAddFriendButton :user />
        <MessageModelUserProfileCardMoreMenu :user />
      </template>
    </MessageModelUserProfileCardHeader>
    <v-card-text pt-2 flex flex-col gap-y-3>
      <div>
        <div font-bold>{{ displayName }}</div>
        <div op-medium-emphasis text-body-medium>{{ getStatusMessage(user.id) || getUserStatus(user.id) }}</div>
      </div>
      <template v-if="!isSelf">
        <v-divider />
        <MessageModelUserProfileCardFriendStatus :user />
        <MessageModelUserProfileCardMutualRooms v-if="mutualRooms" :mutual-rooms />
      </template>
    </v-card-text>
  </v-card>
</template>
