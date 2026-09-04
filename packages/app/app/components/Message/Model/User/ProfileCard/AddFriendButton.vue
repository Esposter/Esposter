<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface Props {
  user: Pick<User, "id">;
}

const { user } = defineProps<Props>();
const friendStore = useFriendStore();
const { checkIsFriend } = friendStore;
const friendRequestStore = useFriendRequestStore();
const { checkHasSentFriendRequest, sendFriendRequest } = friendRequestStore;
</script>

<template>
  <v-avatar v-if="!checkIsFriend(user.id) && !checkHasSentFriendRequest(user.id)" color="surface">
    <StyledTooltipIconButton
      :button-props="{ size: 'small' }"
      icon="mdi-account-plus"
      text="Add Friend"
      @click="sendFriendRequest(user.id)"
    />
  </v-avatar>
</template>
