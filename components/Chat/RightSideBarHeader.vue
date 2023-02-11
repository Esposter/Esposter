<script setup lang="ts">
import { useMemberStore } from "@/store/chat/useMemberStore";

const memberStore = useMemberStore();
const { memberList } = $(storeToRefs(memberStore));
const membersCount = $computed(() => memberList.length);
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col font="bold">Members—{{ membersCount }}</v-col>
    </v-row>
  </v-container>
</template>
