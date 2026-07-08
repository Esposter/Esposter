<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

interface ResourceBladeActionsProps {
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  remove: () => Promise<boolean>;
  rename: (name: string) => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const { publication, publish, remove, rename, resource, unpublish } = defineProps<ResourceBladeActionsProps>();
const isPublishable = computed(() => "publishable" in ResourceDefinitionMap[resource.type].capabilities);
const isPortable = computed(() => "portable" in ResourceDefinitionMap[resource.type].capabilities);
</script>

<template>
  <ResourceRenameDialogButton :rename :resource />
  <ResourceDeleteDialogButton :remove :resource />
  <ResourcePublishToggle v-if="isPublishable" :publication :publish :unpublish />
  <ResourcePortableActions v-if="isPortable" />
  <StyledTooltipIconButton icon="mdi-close" text="Close" :button-props="{ to: RoutePath.ResourcesAll }" />
</template>
