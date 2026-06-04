<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

interface FileOptionsMenuProps {
  filename: string;
  hoverProps?: Record<string, unknown>;
  isHovering?: boolean | null;
  url: string;
}

const { filename, hoverProps, isHovering, url } = defineProps<FileOptionsMenuProps>();
const emit = defineEmits<{ delete: [] }>();
const menuItems = computed<Item[]>(() => [
  {
    icon: "mdi-download",
    onClick: () => {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
    },
    title: "Download",
  },
  {
    color: "error",
    icon: "mdi-delete",
    onClick: () => {
      emit("delete");
    },
    title: "Delete",
  },
]);
</script>

<template>
  <StyledCard :card-props="{ elevation: isHovering ? 12 : 2, ...hoverProps }">
    <v-card-actions p-0 gap-0 min-h-auto>
      <v-tooltip
        v-for="{ color, icon, shortTitle, title, onClick } of menuItems"
        :key="title"
        :text="shortTitle ?? title"
      >
        <template #activator="{ props }">
          <v-btn :color density="comfortable" :icon size="small" tile m-0 :="props" @click.stop="onClick?.($event)" />
        </template>
      </v-tooltip>
    </v-card-actions>
  </StyledCard>
</template>
