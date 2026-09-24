<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
const title = computed(() => `Delete ${prettify(type)} visual`);
const isOpen = ref(false);
</script>

<template>
  <UiIconButton
    :label="title"
    :meaning="UiIconMeaning.Delete"
    :variant="UiButtonVariant.Quiet"
    @click.stop="isOpen = true"
  />
  <UiConfirmDialog
    v-model="isOpen"
    confirm-label="Delete"
    :title
    @confirm="
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
    <p>Delete this visual from the dashboard?</p>
  </UiConfirmDialog>
</template>
