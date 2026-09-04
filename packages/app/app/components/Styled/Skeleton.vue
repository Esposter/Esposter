<script setup lang="ts">
import type { VSkeletonLoader } from "vuetify/components";

interface Props {
  type?: VSkeletonLoader["$props"]["type"];
}

const { type = "card" } = defineProps<Props>();
</script>

<template>
  <!-- `b-solid` is explicit: unlike `v-card`, `v-skeleton-loader` declares no border-style of its own, so a
    bare `b-1` sets a width against the initial `none` and the skeleton renders borderless -->
  <v-skeleton-loader b-1 b-border b-solid :type />
</template>
