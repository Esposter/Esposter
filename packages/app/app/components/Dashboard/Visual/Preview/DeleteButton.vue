<script setup lang="ts">
import type { VisualType } from "#shared/models/dashboard/data/VisualType";

import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";
import { withFinalizerAsync } from "@esposter/shared";

interface DeleteButtonProps {
  id: string;
  type: VisualType;
}

const { id, type } = defineProps<DeleteButtonProps>();
const visualStore = useVisualStore();
const { deleteVisual } = visualStore;
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: `Delete ${prettify(type)} Visual`, text: 'Are you sure you want to delete this visual?' }"
    @delete="async (onComplete) => await withFinalizerAsync(() => deleteVisual({ id }), onComplete)"
  >
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ class: 'right-0 top-0 absolute', size: 'small' }"
        icon="mdi-close"
        :text="`Delete ${prettify(type)} Visual`"
        @click.stop="updateIsOpen(true)"
      />
    </template>
  </StyledDeleteFormDialog>
</template>
