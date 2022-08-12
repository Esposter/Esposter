<script setup lang="ts">
import { useMemberStore } from "@/store/useMemberStore";
import { storeToRefs } from "pinia";

const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
</script>

<template>
  <v-list>
    <ChatMemberListItem v-for="member in members" :key="member.id" :member="member" />
  </v-list>
</template>
