<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface MembersProps {
  room: RoomInMessage;
}

const { room } = defineProps<MembersProps>();
const roleStore = useRoleStore();
const { selectedMemberId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const selectedMember = computed(() =>
  selectedMemberId.value ? (members.value.find(({ id }) => id === selectedMemberId.value) ?? null) : null,
);
</script>

<template>
  <div flex gap-x-6 h-full>
    <div flex shrink-0 flex-col w-56 overflow-y-auto>
      <MessageModelRoomSettingsTypeMemberList :room-id="room.id" />
    </div>
    <div v-if="selectedMember" flex-1 overflow-y-auto>
      <MessageModelRoomSettingsTypeMemberEditor :key="selectedMember.id" :member="selectedMember" :room-id="room.id" />
    </div>
    <div v-else flex flex-1 items-center justify-center op-medium-emphasis>Select a member to manage their roles.</div>
  </div>
</template>
