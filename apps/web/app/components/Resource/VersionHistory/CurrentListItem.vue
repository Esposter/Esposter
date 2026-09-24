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
      px-2
      py-1
      ui-item
      flex
      flex-col
      w-full
      @click="stopPreviewingSnapshot"
    >
      <span flex gap-2 items-center>
        Current
        <UiChip :token="UiToken.Accent">Working copy</UiChip>
      </span>
      <ResourceVersionHistoryTime :datetime="resource.updatedAt" text-muted />
    </button>
  </li>
</template>
