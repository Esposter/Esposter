<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { ResourceBladeType } from "@/models/resource/ResourceBladeType";

interface ResourceBladeOutletProps {
  activeBlade: ResourceBladeType;
  publication?: ResourcePublication;
  resource: Resource;
}

const { activeBlade, publication, resource } = defineProps<ResourceBladeOutletProps>();
</script>

<template>
  <ResourceOverview v-if="activeBlade === ResourceBladeType.Overview" :publication :resource />
  <ResourceEditorLaunch v-else :resource />
</template>
