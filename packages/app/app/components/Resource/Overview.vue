<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceTypeRoutePathMap } from "@/services/resource/ResourceTypeRoutePathMap";
import { RoutePath } from "@esposter/shared";

interface ResourceOverviewProps {
  publication?: ResourcePublication;
  resource: Resource;
}

const { publication, resource } = defineProps<ResourceOverviewProps>();
const publicUrl = computed(() => RoutePath.View(resource.type, resource.id));
const copyPublicLink = () => window.navigator.clipboard.writeText(`${window.location.origin}${publicUrl.value}`);
</script>

<template>
  <div pa-6 flex flex-col gap-4>
    <div flex flex-wrap gap-2 items-center>
      <v-icon size="large" :icon="ResourceDefinitionMap[resource.type].icon" />
      <span text-h6>{{ resource.name }}</span>
      <v-btn
        prepend-icon="mdi-open-in-new"
        size="small"
        variant="tonal"
        :to="ResourceTypeRoutePathMap[resource.type](resource.id)"
      >
        Open editor
      </v-btn>
    </div>
    <v-card>
      <v-card-title text-subtitle-1>Essentials</v-card-title>
      <v-card-text>
        <div gap-x-6 gap-y-2 grid items-center :style="{ gridTemplateColumns: 'auto 1fr' }">
          <span text-medium-emphasis>Type</span>
          <span>{{ ResourceDefinitionMap[resource.type].title }}</span>
          <span text-medium-emphasis>Created</span>
          <span>{{ dayjs(resource.createdAt).format("ddd, MMM D, YYYY h:mm A") }}</span>
          <span text-medium-emphasis>Updated</span>
          <span>{{ dayjs(resource.updatedAt).fromNow() }}</span>
          <span text-medium-emphasis>Status</span>
          <div flex gap-2 items-center>
            <template v-if="publication">
              <v-chip color="success" size="small">Published</v-chip>
              <span text-medium-emphasis>v{{ publication.publishVersion }}</span>
            </template>
            <v-chip v-else size="small">Draft</v-chip>
          </div>
          <template v-if="publication">
            <span text-medium-emphasis>Public link</span>
            <div flex flex-wrap gap-2 items-center>
              <a :href="publicUrl" target="_blank" rel="noopener">{{ publicUrl }}</a>
              <StyledTooltipIconButton icon="mdi-content-copy" text="Copy link" @click="copyPublicLink" />
            </div>
          </template>
        </div>
      </v-card-text>
    </v-card>
    <slot name="summary" />
  </div>
</template>
