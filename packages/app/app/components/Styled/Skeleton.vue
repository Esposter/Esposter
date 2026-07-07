<script setup lang="ts">
import type { VSkeletonLoader } from "vuetify/components";

interface StyledSkeletonProps {
  type?: VSkeletonLoader["$props"]["type"];
}

const { type = "card" } = defineProps<StyledSkeletonProps>();
</script>

<template>
  <v-skeleton-loader b-1 :type />
</template>
