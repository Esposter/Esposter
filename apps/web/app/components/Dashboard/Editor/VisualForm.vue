<script setup lang="ts">
import { useVisualStore } from "@/store/dashboard/visual";

// The inspector's entry for a selected visual. Its form is mounted once a draft exists, keyed by the visual so a form for
// Another visual starts afresh
const visualStore = useVisualStore();
const { editedItem } = storeToRefs(visualStore);
</script>

<template>
  <DashboardEditorVisualFormFields v-if="editedItem" :key="editedItem.id" v-model="editedItem" />
</template>
