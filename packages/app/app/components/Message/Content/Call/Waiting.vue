<script setup lang="ts">
import { useKnockerStore } from "@/store/message/room/call/knocker";

const knockerStore = useKnockerStore();
const { cancelKnock } = knockerStore;
</script>

<template>
  <div bg-background flex flex-col items-center justify-center size-full gap-y-6 p-6>
    <v-progress-circular color="primary" indeterminate size="64" />
    <div flex flex-col gap-y-2 items-center text-center>
      <h2 text-headline-small font-medium>Waiting to be admitted</h2>
      <span text-medium-emphasis text-body-medium>Someone in the call will let you in soon.</span>
    </div>
    <v-btn text="Cancel" variant="outlined" @click="cancelKnock()" />
  </div>
</template>
