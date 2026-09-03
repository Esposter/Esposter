<script setup lang="ts">
import { useMemberStore } from "@/store/message/user/member";

const memberStore = useMemberStore();
const { memberCount } = storeToRefs(memberStore);
</script>

<template>
  <v-container fluid>
    <v-row items-center>
      <v-col font-bold>Members—{{ memberCount }}</v-col>
    </v-row>
  </v-container>
</template>
