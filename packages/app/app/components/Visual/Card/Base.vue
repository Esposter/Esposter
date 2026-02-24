<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

interface BaseCardProps {
  card: Card;
}

const { card } = defineProps<BaseCardProps>();
const { sm, xs } = useDisplay();
</script>

<template>
  <StyledCard
    :class="xs ? 'text-title-large' : sm ? 'text-headline-small' : 'text-headline-large'"
    flex="!"
    font="[Montserrat] italic"
    justify-center
    items-center
    text-center
    p-4
    break-anywhere
    :card-props="{ minHeight: '12rem' }"
  >
    {{ card.text }}
  </StyledCard>
</template>
