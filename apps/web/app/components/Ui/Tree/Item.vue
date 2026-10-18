<script setup lang="ts">
import type { UiTreeItem } from "@/models/ui/UiTreeItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { Treeview } from "@vuetify/v0";

interface Props {
  item: UiTreeItem;
}
// One item of a tree, open from the start with its children beneath it
// Its row indents one more step at each depth it sits at
const { item } = defineProps<Props>();
</script>

<template>
  <Treeview.Item
    #default="{ depth, isSelected }"
    :data-item-id="item.id"
    :data-item-title="item.title"
    :value="item.id"
  >
    <UiTreeOpener />
    <Treeview.Activator #default="{ attrs }" renderless>
      <button
        :="attrs"
        ui-item
        flex
        flex-1
        gap-2
        min-w-0
        items-center
        :style="{ paddingInlineStart: `calc(var(--ui-step) * ${depth + 2})` }"
      >
        <Treeview.Cue #default="{ attrs: cueAttrs }" renderless>
          <UiIcon :="cueAttrs" class="cue" :meaning="UiIconMeaning.Disclosure" />
        </Treeview.Cue>
        <UiItemContent is-markless flex-1 :title="item.title" />
        <UiIcon v-if="isSelected" :meaning="UiIconMeaning.Selected" text-accent />
      </button>
    </Treeview.Activator>
    <Treeview.Content>
      <Treeview.Group>
        <UiTreeItem v-for="child of item.children" :key="child.id" :item="child" />
      </Treeview.Group>
    </Treeview.Content>
  </Treeview.Item>
</template>

<style scoped>
.cue[data-state="open"] {
  rotate: 90deg;
}
</style>
