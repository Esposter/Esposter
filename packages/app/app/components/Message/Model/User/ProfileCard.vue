<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useStatusStore } from "@/store/message/user/status";

interface UserProfileCardProps {
  user: Pick<User, "id" | "image" | "name">;
}

const { user } = defineProps<UserProfileCardProps>();
const { $trpc } = useNuxtApp();
const { data: session } = await authClient.useSession(useFetch);
const statusStore = useStatusStore();
const { getStatusEnum, getStatusMessage } = statusStore;
const isSelf = computed(() => session.value?.user.id === user.id);
const mutualRooms = await $trpc.room.readMutualRooms.query({ userId: user.id });
const statusMessage = computed(() => getStatusMessage(user.id));
const statusEnum = computed(() => getStatusEnum(user.id));
</script>

<template>
  <v-card min-w="260px">
    <MessageModelUserProfileCardHeader :user :is-self>
      <template v-if="!isSelf" #actions>
        <MessageModelUserProfileCardAddFriendButton :user />
        <MessageModelUserProfileCardMoreMenu :user />
      </template>
    </MessageModelUserProfileCardHeader>
    <v-card-text flex flex-col gap-y-3 pt-2>
      <div>
        <div font-bold>{{ user.name }}</div>
        <div text-sm text-gray>{{ statusMessage || statusEnum }}</div>
      </div>
      <template v-if="!isSelf">
        <v-divider />
        <MessageModelUserProfileCardFriendStatus :user />
        <MessageModelUserProfileCardMutualRooms :mutual-rooms />
      </template>
    </v-card-text>
  </v-card>
</template>
