<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useResourceStore } from "@/store/resource";

const resourceStore = useResourceStore();
const { heldSave } = storeToRefs(resourceStore);
const { keepUnwrittenContent, takeOtherSave } = resourceStore;
</script>

<template>
  <!-- Held rather than adopted because the person has an edit the other save would replace: the notice says so where
    they are already looking, and autosave waits until they answer -->
  <UiAlert v-if="heldSave" status="warning">
    <div flex gap-2 items-center justify-between>
      <span>Saved on another device while you have an unsaved edit</span>
      <div flex gap-2>
        <UiButton :variant="UiButtonVariant.Quiet" @click="takeOtherSave()">Take theirs</UiButton>
        <UiButton :variant="UiButtonVariant.Accent" @click="keepUnwrittenContent()">Keep mine</UiButton>
      </div>
    </div>
  </UiAlert>
</template>
