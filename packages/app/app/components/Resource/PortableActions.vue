<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

interface ResourcePortableActionsProps {
  resource: Resource;
}

const { resource } = defineProps<ResourcePortableActionsProps>();
const { exportFormats, importFormats } = usePortableFormats(() => resource);
</script>

<template>
  <v-menu v-if="importFormats.length > 0">
    <template #activator="{ props }">
      <StyledButton :button-props="{ ...props, prependIcon: 'mdi-import', variant: 'text' }">Import</StyledButton>
    </template>
    <v-list>
      <v-list-item
        v-for="format in importFormats"
        :key="format.label"
        :title="format.label"
        @click="
          () => {
            format.import?.();
          }
        "
      />
    </v-list>
  </v-menu>
  <v-menu v-if="exportFormats.length > 0">
    <template #activator="{ props }">
      <StyledButton :button-props="{ ...props, prependIcon: 'mdi-export', variant: 'text' }">Export</StyledButton>
    </template>
    <v-list>
      <v-list-item
        v-for="format in exportFormats"
        :key="format.label"
        :title="format.label"
        @click="
          () => {
            format.export?.();
          }
        "
      />
    </v-list>
  </v-menu>
</template>
