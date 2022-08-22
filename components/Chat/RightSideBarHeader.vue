<script setup lang="ts">
import { useMemberStore } from "@/store/useMemberStore";
import { storeToRefs } from "pinia";

const memberStore = useMemberStore();
const { memberList } = storeToRefs(memberStore);
const membersCount = computed(() => memberList.value.length);
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col class="text-subtitle-2" font="bold">Members—{{ membersCount }}</v-col>
    </v-row>
  </v-container>
</template>
