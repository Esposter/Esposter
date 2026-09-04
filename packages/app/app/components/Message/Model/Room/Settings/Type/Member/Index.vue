<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface MemberProps {
  room: RoomInMessage;
}

const { room } = defineProps<MemberProps>();
const roleStore = useRoleStore();
const { selectedMemberId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const selectedMember = computed(() => members.value.find(({ id }) => id === selectedMemberId.value));
</script>

<template>
  <v-row no-gutters>
    <v-col cols="12" sm="4" md="3" lg="2" pe-6>
      <MessageModelRoomSettingsTypeMemberList :room-id="room.id" />
    </v-col>
    <v-col v-if="selectedMember">
      <MessageModelRoomSettingsTypeMemberEditor :key="selectedMember.id" :member="selectedMember" :room-id="room.id" />
    </v-col>
    <MessageModelRoomSettingsTypeDetailPlaceholder v-else text="Select a member to manage their roles." />
  </v-row>
</template>
