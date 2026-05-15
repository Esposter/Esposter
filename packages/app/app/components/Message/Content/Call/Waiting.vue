<script setup lang="ts">
import { useKnockerStore } from "@/store/message/room/call/knocker";

const knockerStore = useKnockerStore();
const { cancelKnock } = knockerStore;
</script>

<template>
  <div p-6 bg-background flex flex-col gap-y-6 size-full items-center justify-center>
    <v-progress-circular color="primary" indeterminate size="64" />
    <div text-center flex flex-col gap-y-2 items-center>
      <h2 font-medium text-headline-small>Waiting to be admitted</h2>
      <span text-medium-emphasis text-body-medium>Someone in the call will let you in soon.</span>
    </div>
    <v-btn text="Cancel" variant="outlined" @click="cancelKnock()" />
  </div>
</template>
