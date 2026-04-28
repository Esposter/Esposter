<script setup lang="ts">
import type { VList } from "vuetify/components";

import { mergeProps } from "vue";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StyledListProps {
  listAttrs?: VList["$attrs"];
  listProps?: VList["$props"];
  selectedIndex?: number;
}

const slots = defineSlots<Record<keyof VList["$slots"], () => VNode>>();
const { listAttrs = {}, listProps = {}, selectedIndex } = defineProps<StyledListProps>();
const listRef = useTemplateRef("listRef");

watch(
  () => selectedIndex,
  async (newSelectedIndex) => {
    if (newSelectedIndex === undefined) return;
    await nextTick();
    listRef.value?.$el.children[newSelectedIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },
);
</script>

<template>
  <v-list ref="listRef" :="mergeProps(listProps, listAttrs)">
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="{ ...scope }" />
    </template>
  </v-list>
</template>
