<script setup lang="ts">
import type { UiListItem } from "#src/models/ui/UiListItem";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiTextFieldType } from "#src/models/ui/UiTextFieldType";
import { getMemberDescription } from "#src/services/message/member/getMemberDescription";
import { useRoleStore } from "#src/store/message/room/role";
import { useMemberStore } from "#src/store/message/user/member";
import { DEFAULT_PAGE_LIMIT } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

const roleStore = useRoleStore();
const { selectMember } = roleStore;
const { selectedMemberId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
// A member goes by their displayName in the room they are named in, with the account name beside it where they differ
const memberItems = computed(() =>
  members.value.map<UiListItem<string>>((member) => ({
    description: getMemberDescription(member, ""),
    image: member.image,
    title: member.displayName,
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
      <MessageModelRoomRowSkeleton v-for="index of DEFAULT_PAGE_LIMIT" :key="index" />
    </div>
    <template v-else>
      <UiList v-if="memberItems.length > 0" v-model="selectedMemberIds" :items="memberItems" label="Members" />
      <UiEmptyState v-else :meaning="UiIconMeaning.Person" title="No member goes by that name." />
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreMembers(onComplete)">
        <MessageModelRoomRowSkeleton v-for="index of DEFAULT_PAGE_LIMIT" :key="index" />
      </StyledWaypoint>
    </template>
  </div>
</template>
