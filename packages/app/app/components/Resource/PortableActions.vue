<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { PortableFormatMap } from "@/services/resource/PortableFormatMap";

interface ResourcePortableActionsProps {
  resource: Resource;
}

const { resource } = defineProps<ResourcePortableActionsProps>();
// BladeActions only renders this for portable types, so the guard also narrows the map key
const formats = computed(() => (hasCapability(resource.type, "portable") ? PortableFormatMap[resource.type] : []));
const exportFormats = computed(() => formats.value.filter(({ export: exportFn }) => exportFn));
// Import lands with the File type's blade migration (roadmap Phase 4); Email is export-only
</script>

<template>
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
