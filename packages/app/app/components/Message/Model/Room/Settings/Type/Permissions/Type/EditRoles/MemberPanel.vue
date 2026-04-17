<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface MemberPanelProps {
  roomId: Room["id"];
}

defineProps<MemberPanelProps>();
const roleStore = useRoleStore();
const { selectMember } = roleStore;
const { selectedMemberId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const { readMembers, readMoreMembers } = useReadMembers();

onMounted(() => {
  readMembers();
});
</script>

<template>
  <v-list density="compact" rounded>
    <v-list-item
      v-for="member of members"
      :key="member.id"
      :active="member.id === selectedMemberId"
      @click="selectMember(member.id)"
    >
      <template #prepend>
        <StyledAvatar :image="member.image" :name="member.name" mr-2 size="24" />
      </template>
      <v-list-item-title>{{ member.name }}</v-list-item-title>
    </v-list-item>
    <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </StyledWaypoint>
  </v-list>
</template>
