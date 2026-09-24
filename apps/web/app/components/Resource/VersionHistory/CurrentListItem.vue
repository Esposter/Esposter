<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

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
      <span flex flex-1 gap-2 min-w-0 items-center>
        Current
        <UiChip :token="UiToken.Accent">Working copy</UiChip>
      </span>
      <ResourceVersionHistoryTime :datetime="resource.updatedAt" text-muted shrink-0 />
    </button>
  </li>
</template>
