<script setup lang="ts">
import type { Card } from "@/components/Visual/types";

interface BaseCardProps {
  card: Card;
}

const { card } = defineProps<BaseCardProps>();
</script>

<template>
  <v-card min-height="200" display="flex" items="center">
    <v-card-text class="text-h4" display="flex" justify="center" font="bold">
      {{ card.text }}
    </v-card-text>
  </v-card>
</template>
