<script setup lang="ts">
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";

const findReplaceStore = useFindReplaceStore();
const { isFindReplaceOpen } = storeToRefs(findReplaceStore);
</script>

<template>
  <v-tooltip text="Find & Replace">
    <template #activator="{ props }">
      <v-btn icon="mdi-magnify" size="small" tile m-0 :="props" @click.stop="isFindReplaceOpen = !isFindReplaceOpen" />
    </template>
  </v-tooltip>
</template>
