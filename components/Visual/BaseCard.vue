<script setup lang="ts">
import type { Card } from "@/components/Visual/types";

interface BaseCardProps {
  card: Card;
}

const { card } = defineProps<BaseCardProps>();
</script>

<template>
  <v-card
    class="text-h4"
    min-height="200"
    p="4"
    display="flex"
    justify="center"
    items="center"
    un-text="center"
    font="Montserrat! bold"
  >
    {{ card.text }}
  </v-card>
</template>
