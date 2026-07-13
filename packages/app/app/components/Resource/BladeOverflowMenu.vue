<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { mergeProps } from "vue";

interface ResourceBladeOverflowMenuProps {
  duplicate: () => Promise<void>;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const { duplicate, publication, publish, resource, unpublish } = defineProps<ResourceBladeOverflowMenuProps>();
const isPublishable = computed(() => "publishable" in ResourceDefinitionMap[resource.type].capabilities);
const { exportFormats, importFormats } = usePortableFormats(() => resource);
const portableFormatItems = computed(() => [
  ...importFormats.value.map(({ import: importFormat, label }) => ({
    action: importFormat,
    icon: "mdi-import",
    title: `Import ${label}`,
  })),
  ...exportFormats.value.map(({ export: exportFormat, label }) => ({
    action: exportFormat,
    icon: "mdi-export",
    title: `Export ${label}`,
  })),
]);
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-tooltip text="More commands">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-dots-horizontal" :="mergeProps(menuProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact">
      <v-list-item prepend-icon="mdi-content-copy" title="Duplicate" @click="duplicate()" />
      <template v-if="isPublishable">
        <v-list-item v-if="publication" prepend-icon="mdi-cloud-off-outline" title="Unpublish" @click="unpublish()" />
        <v-list-item v-else prepend-icon="mdi-cloud-upload" title="Publish" @click="publish()" />
      </template>
      <v-list-item
        v-for="{ action, icon, title } of portableFormatItems"
        :key="title"
        :prepend-icon="icon"
        :title
        @click="
          () => {
            action?.();
          }
        "
      />
    </v-list>
  </v-menu>
</template>
