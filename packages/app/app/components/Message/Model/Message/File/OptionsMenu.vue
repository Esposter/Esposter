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
      const anchor = window.document.createElement("a");
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
      <StyledTooltipIconButton
        v-for="{ color, icon, shortTitle, title, onClick } of menuItems"
        :key="title"
        :button-props="{ class: 'm-0', color, density: 'comfortable', size: 'small', tile: true }"
        :icon
        :text="shortTitle ?? title"
        @click.stop="onClick?.($event)"
      />
    </v-card-actions>
  </StyledCard>
</template>
