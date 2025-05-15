<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { useEsbabblerStore } from "@/store/esbabbler";
import { mergeProps } from "vue";

interface MessageOptionsMenuProps {
  deleteMessageItem: Item;
  rowKey: string;
  updateMessageItems: Item[];
}

const { deleteMessageItem, rowKey, updateMessageItems } = defineProps<MessageOptionsMenuProps>();
const emit = defineEmits<{ "update:menu": [value: boolean] }>();
const esbabblerStore = useEsbabblerStore();
const { optionsMenu } = storeToRefs(esbabblerStore);
</script>

<template>
  <v-menu
    :model-value="optionsMenu?.rowKey === rowKey"
    transition="none"
    location="left"
    :target="optionsMenu?.target"
    @update:model-value="
      (value) => {
        // We just need to set a placeholder so that the menu will appear
        if (value) optionsMenu = { rowKey, target: 'true' };
        else optionsMenu = undefined;
        emit('update:menu', value);
      }
    "
  >
    <template #activator="{ props: menuProps }">
      <v-tooltip text="More">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0="!" rd-none="!" icon="mdi-dots-horizontal" size="small" :="mergeProps(menuProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-list>
      <v-list-item v-for="{ title, color, icon, onClick } of updateMessageItems" :key="title" @click="onClick">
        <span :class="color ? `text-${color}` : undefined">{{ title }}</span>
        <template #append>
          <v-icon size="small" :color :icon />
        </template>
      </v-list-item>
      <v-list-item py-2="!" min-height="auto">
        <v-divider />
      </v-list-item>
      <v-list-item @click="deleteMessageItem.onClick">
        <span :class="`text-${deleteMessageItem.color}`">{{ deleteMessageItem.title }}</span>
        <template #append>
          <v-icon size="small" :color="deleteMessageItem.color" :icon="deleteMessageItem.icon" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
