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
    :class="xs ? 'text-h6' : sm ? 'text-h5' : 'text-h4'"
    flex="!"
    font="[Montserrat] italic"
    justify-center
    items-center
    text-center
    p-4
    break-anywhere
    :card-props="{ minHeight: '200' }"
  >
    {{ card.text }}
  </StyledCard>
</template>
