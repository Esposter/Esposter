<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { downloadUrl } from "@/services/app/downloadUrl";
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";

interface Props {
  filename: string;
  hoverProps?: Record<string, unknown>;
  isHovering?: boolean | null;
  url: string;
}

const { filename, hoverProps, isHovering, url } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
const menuItems = computed<Item[]>(() => [
  {
    icon: "mdi-download",
    onClick: () => {
      downloadUrl(url, filename);
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
const cardProps = computed(() => ({ elevation: isHovering ? 12 : 2, ...hoverProps }));
// The row is one child component already, so its per-item props are hoisted here rather than into another
// Component — a loop variable has no script scope to memoize them in
const titleButtonPropsMap = computed(
  () =>
    new Map(
      menuItems.value.map(({ color, title }) => [
        title,
        { ...DENSE_ICON_BUTTON_PROPS, color, density: "comfortable" as const },
      ]),
    ),
);
</script>

<template>
  <StyledCard :card-props>
    <v-card-actions p-0 gap-0 min-h-auto>
      <StyledTooltipIconButton
        v-for="{ icon, shortTitle, title, onClick } of menuItems"
        :key="title"
        :button-props="titleButtonPropsMap.get(title)"
        :icon
        :text="shortTitle ?? title"
        @click.stop="onClick?.($event)"
      />
    </v-card-actions>
  </StyledCard>
</template>
