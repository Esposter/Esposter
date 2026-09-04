<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";
import { noop } from "@esposter/shared";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { selectMember } = roleStore;
const { selectedMemberId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const { readMemberCounts, readMoreMembers, searchMembers } = useReadMembers();
const searchQuery = ref("");
// An empty query is a query rather than a reset, so emptying the field lists the room again instead of leaving
// The last term's rows on screen — and the first of those reads is the page this panel opens on, which is why
// Nothing here reads a page of its own
const { isPending } = useAutoSearch(searchQuery, {
  isIncludeEmptySearchQuery: true,
  reset: noop,
  search: async (newSearchQuery, signal) => {
    await searchMembers(newSearchQuery, signal);
  },
});

await readMemberCounts();
</script>

<template>
  <div flex flex-col gap-2>
    <v-text-field
      v-model="searchQuery"
      density="compact"
      placeholder="Search members"
      prepend-inner-icon="mdi-magnify"
      clearable
    />
    <v-list density="compact" rd>
      <template v-if="isPending">
        <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </template>
      <template v-else>
        <MessageModelRoomSettingsTypeMemberListItem
          v-for="member of members"
          :key="member.id"
          :active="member.id === selectedMemberId"
          :member
          :room-id
          @click="selectMember(member.id)"
        />
        <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
          <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
        </StyledWaypoint>
      </template>
    </v-list>
  </div>
</template>
