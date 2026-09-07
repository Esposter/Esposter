<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  id: Visual["id"];
  type: Visual["type"];
}

const { id, type } = defineProps<Props>();
const visualStore = useVisualStore();
const { deleteVisual } = visualStore;
const cardProps = computed(() => ({ title: `Delete ${prettify(type)} Visual` }));
</script>

<template>
  <StyledDeleteFormDialog
    :card-props
    @delete="
      async (onComplete) => {
        let isSuccessful = false;
        await withFinalizerAsync(
          async () => {
            isSuccessful = await deleteVisual({ id });
          },
          () => {
            onComplete(isSuccessful);
          },
        );
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ size: 'small' }"
        icon="mdi-close"
        :text="cardProps.title"
        @click.stop="updateIsOpen(true)"
      />
    </template>
    Are you sure you want to delete this visual?
  </StyledDeleteFormDialog>
</template>
