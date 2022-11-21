<script setup lang="ts">
import { useMemberStore } from "@/store/useMemberStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const memberStore = useMemberStore();
const { pushMemberList, updateMemberListNextCursor, initialiseMembersList } = memberStore;
const { memberList, memberListNextCursor } = storeToRefs(memberStore);
const hasMore = $computed(() => Boolean(memberListNextCursor.value));
const fetchMoreMembers = async (onComplete: () => void) => {
  const { members, nextCursor } = await $client.room.readMembers.query({ cursor: memberListNextCursor.value });
  pushMemberList(members);
  updateMemberListNextCursor(nextCursor);
  onComplete();
};

const { members, nextCursor } = await $client.room.readMembers.query({ cursor: null });
initialiseMembersList(members);
updateMemberListNextCursor(nextCursor);
</script>

<template>
  <ChatModelMemberList :members="memberList" :has-more="hasMore" :fetch-more-members="fetchMoreMembers" />
</template>
