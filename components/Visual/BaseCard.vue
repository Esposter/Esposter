<script setup lang="ts">
import type { Card } from "@/components/Visual/types";

interface BaseCardProps {
  card: Card;
}

const { card } = defineProps<BaseCardProps>();
</script>

<template>
  <v-card>
    <v-card-text>
      {{ card.text }}
    </v-card-text>
  </v-card>
</template>
