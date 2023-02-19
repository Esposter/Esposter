<script setup lang="ts">
import type { Card } from "@/models/visual/card";
import { useDisplay } from "vuetify";

interface BaseCardProps {
  card: Card;
}

const props = defineProps<BaseCardProps>();
const { card } = $(toRefs(props));
const { xs, sm } = $(useDisplay());
</script>

<template>
  <StyledCard
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
  </StyledCard>
</template>
