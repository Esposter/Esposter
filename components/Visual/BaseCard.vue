<script setup lang="ts">
import type { Card } from "@/components/Visual/types";
import { useDisplay } from "vuetify/lib/framework.mjs";

interface BaseCardProps {
  card: Card;
}

const { card } = defineProps<BaseCardProps>();
const { xs, sm } = useDisplay();
</script>

<template>
  <v-card
    :class="xs ? 'text-h6' : sm ? 'text-h5' : 'text-h4'"
    p="4"
    min-height="200"
    display="flex!"
    justify="center"
    items="center"
    un-text="center"
    font="Montserrat! bold"
    break="word"
  >
    {{ card.text }}
  </v-card>
</template>
