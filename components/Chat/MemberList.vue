<script setup lang="ts">
import { useMemberStore } from "@/store/useMemberStore";
import { storeToRefs } from "pinia";

const client = useClient();
const memberStore = useMemberStore();
const { pushMemberList, updateMemberListNextCursor, initialiseMembersList } = memberStore;
const { memberList, memberListNextCursor } = storeToRefs(memberStore);
const hasMore = computed(() => Boolean(memberListNextCursor.value));
const fetchMoreRooms = async (finishLoading: () => void) => {
  const { members, nextCursor } = await client.query("room.readMembers", { cursor: memberListNextCursor.value });
  pushMemberList(members);
  updateMemberListNextCursor(nextCursor);
  finishLoading();
};

onMounted(async () => {
  const { members, nextCursor } = await client.query("room.readMembers", { cursor: null });

  initialiseMembersList(members);
  updateMemberListNextCursor(nextCursor);
});
</script>

<template>
  <v-list>
    <ChatMemberListItem v-for="member in memberList" :key="member.id" :member="member" />
    <Waypoint :active="hasMore" @change="fetchMoreRooms" />
  </v-list>
</template>
