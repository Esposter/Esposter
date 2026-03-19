<script setup lang="ts">
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";

const findReplaceStore = useFindReplaceStore();
const { isFindReplaceOpen } = storeToRefs(findReplaceStore);
</script>

<template>
  <v-tooltip text="Find & Replace">
    <template #activator="{ props }">
      <v-btn m-0 icon="mdi-magnify" size="small" tile :="props" @click.stop="isFindReplaceOpen = !isFindReplaceOpen" />
    </template>
  </v-tooltip>
</template>
