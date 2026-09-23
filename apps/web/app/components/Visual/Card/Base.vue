<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

interface Props {
  card: Card;
}

const { card } = defineProps<Props>();
</script>

<template>
  <div p-4 text-center flex min-h-48 break-anywhere items-center justify-center ui-frame ui-heading md:ui-title>
    {{ card.text }}
  </div>
</template>
