<script setup lang="ts">
import { useKnockerStore } from "@/store/message/room/call/knocker";

const knockerStore = useKnockerStore();
const { cancelKnock } = knockerStore;
</script>

<template>
  <div role="status" p-6 text-center flex flex-col gap-4 size-full items-center justify-center>
    <UiSpinner />
    <h1 ui-title>Waiting to be admitted</h1>
    <p text-muted>Keep this window open. Someone in the call will let you in soon.</p>
    <UiButton @click="cancelKnock()">Cancel request</UiButton>
  </div>
</template>
