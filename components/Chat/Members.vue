<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMemberStore } from "@/store/useMemberStore";

const { $client } = useNuxtApp();
const memberStore = useMemberStore();
const { pushMemberList, updateMemberListNextCursor, initialiseMembersList } = memberStore;
const { memberList, memberListNextCursor } = storeToRefs(memberStore);
const hasMore = $computed(() => Boolean(memberListNextCursor.value));
const fetchMoreMembers = async (finishLoading: () => void) => {
  const { data } = await $client.room.readMembers.query({ cursor: memberListNextCursor.value });
  if (data.value) {
    pushMemberList(data.value.members);
    updateMemberListNextCursor(data.value.nextCursor);
    finishLoading();
  }
};

const { data } = await $client.room.readMembers.query({ cursor: null });
if (data.value) {
  initialiseMembersList(data.value.members);
  updateMemberListNextCursor(data.value.nextCursor);
}
</script>

<template>
  <ChatModelMemberList :members="memberList" :has-more="hasMore" :fetch-more-members="fetchMoreMembers" />
</template>
