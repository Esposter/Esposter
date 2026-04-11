<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";
import { useStatusStore } from "@/store/message/user/status";
import { RoutePath } from "@esposter/shared";

interface UserProfileCardProps {
  user: Pick<User, "id" | "image" | "name">;
}

const { user } = defineProps<UserProfileCardProps>();
const { $trpc } = useNuxtApp();
const { data: session } = await authClient.useSession(useFetch);

const statusStore = useStatusStore();
const { getStatusEnum, getStatusMessage } = statusStore;

const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const friendRequestStore = useFriendRequestStore();
const { sendFriendRequest } = friendRequestStore;
const { sentFriendRequests } = storeToRefs(friendRequestStore);

const isSelf = computed(() => session.value?.user.id === user.id);
const isFriend = computed(() => friends.value.some(({ id }) => id === user.id));
const hasSentRequest = computed(() => sentFriendRequests.value.some(({ receiverId }) => receiverId === user.id));

const mutualRooms = await $trpc.room.readMutualRooms.query({ userId: user.id });
const statusMessage = computed(() => getStatusMessage(user.id));
const statusEnum = computed(() => getStatusEnum(user.id));
</script>

<template>
  <StyledCard min-w="220px" p-4 flex flex-col gap-3>
    <div flex items-center gap-3>
      <MessageModelMemberStatusAvatar :id="user.id" :image="user.image" :name="user.name" />
      <div flex flex-col overflow-hidden>
        <div font-bold truncate>{{ user.name }}</div>
        <div text-xs text-gray truncate>{{ statusMessage || statusEnum }}</div>
      </div>
    </div>
    <template v-if="!isSelf">
      <v-divider />
      <template v-if="mutualRooms.length > 0">
        <div text-xs font-semibold text-gray uppercase>Mutual Rooms</div>
        <div flex flex-col gap-1>
          <v-chip
            v-for="room of mutualRooms"
            :key="room.id"
            :to="RoutePath.Messages(room.id)"
            density="compact"
            size="small"
          >
            {{ room.name }}
          </v-chip>
        </div>
        <v-divider />
      </template>
      <div flex gap-2 flex-wrap>
        <template v-if="isFriend">
          <v-chip density="compact" color="success" prepend-icon="mdi-account-check" text="Friends" />
        </template>
        <template v-else-if="hasSentRequest">
          <v-chip density="compact" prepend-icon="mdi-clock-outline" text="Request Sent" />
        </template>
        <template v-else>
          <v-btn
            color="primary"
            density="compact"
            prepend-icon="mdi-account-plus"
            size="small"
            text="Add Friend"
            variant="tonal"
            @click="sendFriendRequest(user.id)"
          />
        </template>
      </div>
    </template>
  </StyledCard>
</template>
