<script setup lang="ts">
import { useMemberStore } from "@/store/esbabbler/member";

const memberStore = useMemberStore();
const { memberList } = storeToRefs(memberStore);
const membersCount = computed(() => memberList.value.length);
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col font-bold>Members—{{ membersCount }}</v-col>
    </v-row>
  </v-container>
</template>
