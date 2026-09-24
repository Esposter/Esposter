<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
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
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
// A member goes by their nickname in the room they are named in
const memberItems = computed(() =>
  members.value.map<UiListItem<string>>((member) => ({
    image: member.image,
    title: getDisplayName(member, roomId),
    value: member.id,
  })),
);
const selectedMemberIds = computed({
  get: () => (selectedMemberId.value ? [selectedMemberId.value] : []),
  set: ([newSelectedMemberId]) => {
    if (newSelectedMemberId) selectMember(newSelectedMemberId);
  },
});
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
    <UiTextField v-model="searchQuery" label="Search members" :type="UiTextFieldType.Search" />
    <!-- A member row's own shape while a search is out: the picture and the name -->
    <div v-if="isPending" flex flex-col>
      <div v-for="index of DEFAULT_READ_LIMIT" :key="index" ui-row>
        <UiSkeleton shrink-0 size-6 />
        <UiSkeleton flex-1 h-4 />
      </div>
    </div>
    <template v-else>
      <UiList v-if="memberItems.length > 0" v-model="selectedMemberIds" :items="memberItems" label="Members" />
      <UiEmptyState v-else :meaning="UiIconMeaning.Person" title="No member goes by that name." />
      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <div v-for="index of DEFAULT_READ_LIMIT" :key="index" ui-row>
          <UiSkeleton shrink-0 size-6 />
          <UiSkeleton flex-1 h-4 />
        </div>
      </StyledWaypoint>
    </template>
  </div>
</template>
