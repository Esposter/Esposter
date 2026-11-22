<script setup lang="ts">
import type { CallFeature } from "#src/models/message/room/call/CallFeature";

interface Props extends CallFeature {}

defineProps<Props>();
</script>

<!-- One thing a call can do: its mark and name on one line, a sentence under them -->
<template>
  <div flex flex-col gap-1>
    <div flex gap-2 items-center>
      <span text-accent shrink-0 size-6 :class="icon" />
      <h2 ui-heading>{{ title }}</h2>
    </div>
    <p text-muted ui-lede>{{ description }}</p>
  </div>
</template>
