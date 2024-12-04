<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

interface BaseCardProps {
  card: Card;
}

const { card } = defineProps<BaseCardProps>();
const { sm, xs } = useDisplay();
</script>

<template>
  <!-- @TODO: Add overflow-wrap: anywhere once it's supported in unocss 
   https://github.com/unocss/unocss/issues/2614 -->
  <StyledCard
    :class="xs ? 'text-h6' : sm ? 'text-h5' : 'text-h4'"
    flex="!"
    justify-center
    items-center
    text-center
    font="[Montserrat] italic"
    p-4
    :card-props="{ minHeight: '200' }"
  >
    {{ card.text }}
  </StyledCard>
</template>
