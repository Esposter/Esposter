<script setup lang="ts">
import type { CallFeature } from "@/models/message/room/call/CallFeature";

interface Props extends CallFeature {}

const { description, icon, title } = defineProps<Props>();
</script>

<!-- One thing a call can do: its mark and name on one line, a sentence under them -->
<template>
  <div flex flex-col gap-1>
    <div flex gap-2 items-center>
      <span :class="icon" text-accent shrink-0 size-6 />
      <h2 text-heading-color>{{ title }}</h2>
    </div>
    <p text-muted>{{ description }}</p>
  </div>
</template>
