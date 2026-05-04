<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";
import { mergeProps } from "vue";

interface ProfileCardMoreMenuProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<ProfileCardMoreMenuProps>();
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const friendRequestStore = useFriendRequestStore();
const { sendFriendRequest } = friendRequestStore;
const { sentFriendRequests } = storeToRefs(friendRequestStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const { copy } = useClipboard();
const isFriend = computed(() => friends.value.some(({ id }) => id === user.id));
const hasSentRequest = computed(() => sentFriendRequests.value.some(({ receiverId }) => receiverId === user.id));
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-tooltip text="More">
        <template #activator="{ props: tooltipProps }">
          <v-avatar color="surface">
            <v-btn icon="mdi-dots-horizontal" size="small" :="mergeProps(menuProps, tooltipProps)" />
          </v-avatar>
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact" text-sm>
      <v-list-item
        v-if="!isFriend && !hasSentRequest"
        append-icon="mdi-account-plus"
        title="Add Friend"
        @click="sendFriendRequest(user.id)"
      />
      <MessageModelUserProfileCardMoreMenuModerationItems v-if="currentRoomId" :user :room-id="currentRoomId" />
      <v-list-item append-icon="mdi-identifier" title="Copy User ID" @click="copy(user.id)" />
    </v-list>
  </v-menu>
</template>
