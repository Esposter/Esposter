<script setup lang="ts">
import { useMemberStore } from "@/store/message/member";

const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const membersCount = computed(() => members.value.length);
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col font-bold>Members—{{ membersCount }}</v-col>
    </v-row>
  </v-container>
</template>
