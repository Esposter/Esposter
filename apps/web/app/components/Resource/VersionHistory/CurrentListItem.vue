<script setup lang="ts">
import type { ResourceInResource } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  resource: ResourceInResource;
}

const { resource } = defineProps<Props>();
const { previewSnapshotVersionId, stopPreviewingSnapshot } = useVersionHistoryRoute();
const isHighlighted = computed(() => !previewSnapshotVersionId.value);
</script>

<template>
  <li>
    <button
      :aria-current="isHighlighted || undefined"
      :data-highlighted="isHighlighted || undefined"
      type="button"
      ui-item
      @click="stopPreviewingSnapshot()"
    >
      <UiItemContent :meaning="UiIconMeaning.Edit" title="Current">
        <template #append>
          <ResourceVersionHistoryTime :datetime="resource.updatedAt" text-muted shrink-0 />
        </template>
      </UiItemContent>
    </button>
  </li>
</template>
