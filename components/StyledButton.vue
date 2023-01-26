<script setup lang="ts">
import { mergeProps } from "vue";
import type { VBtn } from "vuetify/components";

interface StyledButtonProps {
  buttonProps?: InstanceType<typeof VBtn>["$props"];
  buttonAttrs?: InstanceType<typeof VBtn>["$attrs"];
}

const props = defineProps<StyledButtonProps>();
const { buttonProps, buttonAttrs } = $(toRefs(props));
const slots = useSlots();
</script>

<template>
  <v-btn class="button" un-color="#fff!" :="mergeProps(buttonProps ?? {}, buttonAttrs ?? {})">
    <ClientOnly>
      <template v-for="(_, slot) of slots" #[slot]="scope">
        <slot :name="slot" :="{ ...scope }" />
      </template>
    </ClientOnly>
  </v-btn>
</template>

<style scoped lang="scss">
.button {
  background-image: $midnightBloom !important;
}
</style>
