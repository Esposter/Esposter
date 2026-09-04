<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { RECYCLE_BIN_RETENTION_DAYS } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

interface Props {
  remove: () => Promise<boolean>;
  resource: Resource;
}

const isOpen = defineModel<boolean>({ default: false });
const { remove, resource } = defineProps<Props>();
</script>

<template>
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Delete resource' }"
    :confirm-name="resource.name"
    @delete="
      async (onComplete) => {
        const isDeleted = await remove();
        onComplete(isDeleted);
        if (isDeleted) await navigateTo(RoutePath.ResourceExplorerAll);
      }
    "
  >
    Deleting this resource moves it to the Recycle bin for {{ RECYCLE_BIN_RETENTION_DAYS }} days.
  </StyledDeleteFormDialog>
</template>
