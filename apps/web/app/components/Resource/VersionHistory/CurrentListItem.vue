<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiToken } from "@/models/ui/UiToken";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const { previewSnapshotVersionId, stopPreviewingSnapshot } = useVersionHistoryRoute();
</script>

<template>
  <li>
    <button
      :aria-current="!previewSnapshotVersionId || undefined"
      type="button"
      ui-item
      @click="stopPreviewingSnapshot"
    >
      <UiItemContent :meaning="UiIconMeaning.Edit" title="Current">
        <template #append>
          <UiChip :token="UiToken.Accent">Working copy</UiChip>
          <ResourceVersionHistoryTime :datetime="resource.updatedAt" text-muted shrink-0 />
        </template>
      </UiItemContent>
    </button>
  </li>
</template>
