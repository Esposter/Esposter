<script setup lang="ts">
const message =
  "Anonymous mode drops participant tokens, so responses stay Awaiting in this Program. Change the survey's response mode to Identified in Collection settings to match participants.";
</script>

<template>
  <UiAlert status="warning">{{ message }}</UiAlert>
</template>
