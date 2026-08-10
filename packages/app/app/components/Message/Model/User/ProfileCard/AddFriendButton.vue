<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface ProfileCardAddFriendButtonProps {
  user: Pick<User, "id">;
}

const { user } = defineProps<ProfileCardAddFriendButtonProps>();
const friendStore = useFriendStore();
const { getIsFriend } = friendStore;
const friendRequestStore = useFriendRequestStore();
const { getHasSentFriendRequest, sendFriendRequest } = friendRequestStore;
const isAddable = computed(() => !getIsFriend(user.id) && !getHasSentFriendRequest(user.id));
</script>

<template>
  <v-avatar v-if="isAddable" color="surface">
    <StyledTooltipIconButton
      :button-props="{ size: 'small' }"
      icon="mdi-account-plus"
      text="Add Friend"
      @click="sendFriendRequest(user.id)"
    />
  </v-avatar>
</template>
