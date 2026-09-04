<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

interface Props {
  card: Card;
}

const { card } = defineProps<Props>();
const { sm, xs } = useVDisplay();
</script>

<template>
  <StyledCard
    :class="xs ? 'text-title-large' : sm ? 'text-headline-small' : 'text-headline-large'"
    font-[montserrat]
    p-4
    text-center
    flex
    break-anywhere
    font-italic
    items-center
    justify-center
    :card-props="{ minHeight: '12rem' }"
  >
    {{ card.text }}
  </StyledCard>
</template>
