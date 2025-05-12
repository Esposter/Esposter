<script setup lang="ts">
import type { OptionMenuItem } from "@/models/esbabbler/message/OptionMenuItem";

interface FileOptionsMenuProps {
  hoverProps?: Record<string, unknown>;
  isHovering?: boolean | null;
}

const { hoverProps, isHovering } = defineProps<FileOptionsMenuProps>();
const emit = defineEmits<{ delete: [] }>();
const menuItems: OptionMenuItem[] = [
  {
    color: "error",
    icon: "mdi-delete",
    onClick: () => {
      emit("delete");
    },
    shortTitle: "Delete",
  },
];
</script>

<template>
  <StyledCard :card-props="{ elevation: isHovering ? 12 : 2, ...hoverProps }">
    <v-card-actions p-0="!" gap-0 min-h-auto="!">
      <v-tooltip
        v-for="{ color, icon, shortTitle, title, onClick } of menuItems"
        :key="title"
        :text="shortTitle ?? title"
      >
        <template #activator="{ props }">
          <v-btn m-0="!" rd-none="!" :color :icon size="small" density="comfortable" :="props" @click="onClick" />
        </template>
      </v-tooltip>
    </v-card-actions>
  </StyledCard>
</template>
