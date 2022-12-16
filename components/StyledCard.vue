<script setup lang="ts">
import { mergeProps } from "vue";
import type { VCard } from "vuetify/components";

interface StyledCardProps {
  cardProps?: InstanceType<typeof VCard>["$props"];
  cardAttrs?: InstanceType<typeof VCard>["$attrs"];
}

const props = defineProps<StyledCardProps>();
const { cardProps, cardAttrs } = $(toRefs(props));
const slots = useSlots();
const { border } = useColors();
</script>

<template>
  <v-card class="border" :="mergeProps(cardProps ?? {}, cardAttrs ?? {})">
    <!-- @NOTE: We should also be able to access slots on the server -->
    <ClientOnly>
      <template v-for="(_, slot) of slots" #[slot]="scope">
        <slot :name="slot" :="{ ...scope }" />
      </template>
    </ClientOnly>
  </v-card>
</template>

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border) !important;
}
</style>
