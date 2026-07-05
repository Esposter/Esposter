<script setup lang="ts">
import type { VisualType } from "#shared/models/dashboard/data/VisualType";

import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

interface DeleteButtonProps {
  id: string;
  type: VisualType;
}

const { id, type } = defineProps<DeleteButtonProps>();
const visualStore = useVisualStore();
const { deleteVisual } = visualStore;
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ class: 'right-0 top-0 absolute', size: 'small' }"
    icon="mdi-close"
    :text="`Delete ${prettify(type)} Visual`"
    @click="deleteVisual({ id })"
  />
</template>
