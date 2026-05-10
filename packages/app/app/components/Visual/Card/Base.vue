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
    flex
    items-center
    break-anywhere
    p-4
    font-[montserrat]
    justify-center
    text-center
    font-italic
    :card-props="{ minHeight: '12rem' }"
  >
    {{ card.text }}
  </StyledCard>
</template>
