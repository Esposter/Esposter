<script setup lang="ts">
import type { VList } from "vuetify/components";

import { mergeProps } from "vue";
// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  listAttrs?: VList["$attrs"];
  listProps?: VList["$props"];
  selectedIndex?: number;
}

const slots = defineSlots<Record<keyof VList["$slots"], () => VNode>>();
const { listAttrs = {}, listProps = {}, selectedIndex } = defineProps<Props>();
const list = useTemplateRef("list");
const mergedListProps = computed(() => mergeProps(listProps, listAttrs));

watch(
  () => selectedIndex,
  (newSelectedIndex) => {
    if (newSelectedIndex === undefined) return;
    list.value?.$el.children[newSelectedIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },
  { flush: "post" },
);
</script>

<template>
  <v-list ref="list" :="mergedListProps">
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="scope" />
    </template>
  </v-list>
</template>
