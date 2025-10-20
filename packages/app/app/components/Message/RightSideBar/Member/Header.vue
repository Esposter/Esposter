<script setup lang="ts">
import { useMemberStore } from "@/store/message/user/member";

const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
// @TODO: Add member count endpoint
const membersCount = computed(() => members.value.length);
</script>

<template>
  <v-container fluid>
    <v-row items-center>
      <v-col font-bold>Members—{{ membersCount }}</v-col>
    </v-row>
  </v-container>
</template>
