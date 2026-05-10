<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

interface BaseCardProps {
  card: Card;
}

const { card } = defineProps<BaseCardProps>();
const { sm, xs } = useVDisplay();
</script>

<template>
  <StyledCard
    :class="xs ? 'text-title-large' : sm ? 'text-headline-small' : 'text-headline-large'"
    font="[Montserrat] italic"
    flex
    items-center
    p-4
    break-anywhere
    justify-center
    text-center
    :card-props="{ minHeight: '12rem' }"
  >
    {{ card.text }}
  </StyledCard>
</template>
