<script setup lang="ts">
import { useSearchDialogStore } from "@/store/resource/searchDialog";

const searchDialogStore = useSearchDialogStore();
const { isOpen } = storeToRefs(searchDialogStore);
</script>

<template>
  <v-dialog v-model="isOpen" width="40rem">
    <ResourceSearchMenu @select="isOpen = false" />
  </v-dialog>
</template>
