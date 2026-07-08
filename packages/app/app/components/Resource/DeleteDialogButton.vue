<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface ResourceDeleteDialogButtonProps {
  remove: () => Promise<boolean>;
  resource: Resource;
}

const { remove, resource } = defineProps<ResourceDeleteDialogButtonProps>();
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Delete resource' }"
    @delete="
      async (onComplete) => {
        const isDeleted = await remove();
        onComplete();
        if (isDeleted) await navigateTo(RoutePath.ResourcesAll);
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-btn color="error" prepend-icon="mdi-delete" variant="text" @click="updateIsOpen(true)">Delete</v-btn>
    </template>
    Delete "{{ resource.name }}"? This cannot be undone.
  </StyledDeleteFormDialog>
</template>
