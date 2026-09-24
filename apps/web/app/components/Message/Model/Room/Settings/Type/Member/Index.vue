<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const roleStore = useRoleStore();
const { selectedMemberId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const selectedMember = computed(() => members.value.find(({ id }) => id === selectedMemberId.value));
</script>

<!-- The members down one side and the one picked beside them, as Discord's roles editor lays out its roles -->
<template>
  <div py-4 gap-6 grid cols-1 ui-body lg:cols-6 md:cols-4 sm:cols-3>
    <MessageModelRoomSettingsTypeMemberList :room-id="room.id" min-w-0 />
    <div flex flex-col min-w-0 lg:col-span-5 md:col-span-3 sm:col-span-2>
      <MessageModelRoomSettingsTypeMemberEditor
        v-if="selectedMember"
        :key="selectedMember.id"
        :member="selectedMember"
        :room-id="room.id"
      />
      <MessageModelRoomSettingsTypeDetailPlaceholder
        v-else
        :meaning="UiIconMeaning.Person"
        text="Select a member to manage their roles."
      />
    </div>
  </div>
</template>
