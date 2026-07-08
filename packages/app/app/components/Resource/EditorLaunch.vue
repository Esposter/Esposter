<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceTypeRoutePathMap } from "@/services/resource/ResourceTypeRoutePathMap";

interface ResourceEditorLaunchProps {
  resource: Resource;
}

const { resource } = defineProps<ResourceEditorLaunchProps>();
</script>

<template>
  <div pa-6 flex flex-col gap-4>
    <div flex gap-2 items-center>
      <v-icon size="large" :icon="ResourceDefinitionMap[resource.type].icon" />
      <span text-h6>Editor</span>
    </div>
    <span op-medium-emphasis>
      Open the {{ ResourceDefinitionMap[resource.type].title }} editor to design and edit this resource's content.
    </span>
    <div>
      <v-btn append-icon="mdi-arrow-right" variant="tonal" :to="ResourceTypeRoutePathMap[resource.type](resource.id)">
        Open editor
      </v-btn>
    </div>
  </div>
</template>
