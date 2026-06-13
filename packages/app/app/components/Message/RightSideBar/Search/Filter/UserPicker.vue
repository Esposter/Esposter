<script setup lang="ts">
import type { AppUserInMessage, SerializableValue } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const roomStore = useRoomStore();
const { currentRoom, currentRoomId } = storeToRefs(roomStore);
const { $trpc } = useNuxtApp();
const appUsers = ref<AppUserInMessage[]>([]);
if (currentRoomId.value) appUsers.value = await $trpc.webhook.readAppUsers.query({ roomId: currentRoomId.value });
</script>

<template>
  <v-list density="compact" py-0 overflow-y-auto>
    <template v-if="isPending">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else-if="currentRoom">
      <MessageModelMemberListItem
        v-for="member of members"
        :key="member.id"
        :member
        :room="currentRoom"
        @click="emit('select', member.id)"
      >
        <template #append="{ hoverProps: { isHovering } }">
          <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
        </template>
      </MessageModelMemberListItem>

      <v-list-item v-for="appUser of appUsers" :key="appUser.id" @click="emit('select', appUser.id)">
        <template #prepend>
          <StyledAvatar :name="appUser.name" />
        </template>
        <v-list-item-title>{{ appUser.name }}</v-list-item-title>
        <v-list-item-subtitle>App</v-list-item-subtitle>
        <template #append="{ hoverProps: { isHovering } }">
          <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
        </template>
      </v-list-item>

      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
