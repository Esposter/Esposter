<script setup lang="ts">
import { useDisplay } from "vuetify";
import type { Card } from "@/components/Visual/types";

interface BaseCardProps {
  card: Card;
}

const props = defineProps<BaseCardProps>();
const { card } = $(toRefs(props));
const { xs, sm } = $(useDisplay());
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
