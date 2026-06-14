<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface ProfileCardAddFriendButtonProps {
  user: Pick<User, "id">;
}

const { user } = defineProps<ProfileCardAddFriendButtonProps>();
const { $trpc } = useNuxtApp();
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const friendRequestStore = useFriendRequestStore();
const { sentFriendRequests } = storeToRefs(friendRequestStore);
const isFriend = computed(() => friends.value.some(({ id }) => id === user.id));
const hasSentRequest = computed(() => sentFriendRequests.value.some(({ receiverId }) => receiverId === user.id));
</script>

<template>
  <v-tooltip v-if="!isFriend && !hasSentRequest" text="Add Friend">
    <template #activator="{ props }">
      <v-avatar color="surface">
        <v-btn
          :="props"
          icon="mdi-account-plus"
          size="small"
          @click="$trpc.friendRequest.sendFriendRequest.mutate(user.id)"
        />
      </v-avatar>
    </template>
  </v-tooltip>
</template>
