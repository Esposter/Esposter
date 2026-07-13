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
  <v-row no-gutters>
    <v-col cols="4" md="3" lg="2" pe-6>
      <MessageModelRoomSettingsTypeMemberList :room-id="room.id" />
    </v-col>
    <v-col v-if="selectedMember">
      <MessageModelRoomSettingsTypeMemberEditor :key="selectedMember.id" :member="selectedMember" :room-id="room.id" />
    </v-col>
    <v-col v-else py-12 flex items-center justify-center op-medium-emphasis
      >Select a member to manage their roles.</v-col
    >
  </v-row>
</template>
