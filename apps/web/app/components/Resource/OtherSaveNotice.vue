<script setup lang="ts">
import { useResourceStore } from "@/store/resource";

const resourceStore = useResourceStore();
const { heldSave } = storeToRefs(resourceStore);
</script>

<template>
  <!-- Held rather than adopted because the person has an edit the other save would replace: the notice says so where
    they are already looking, and autosave waits until they answer -->
  <UiAlert v-if="heldSave" status="warning">
    <span>Saved on another device while you have an unsaved edit</span>
  </UiAlert>
</template>
