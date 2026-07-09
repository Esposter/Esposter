<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getResultAsync, noop, RoutePath } from "@esposter/shared";

interface ResourceOverviewProps {
  publication?: ResourcePublication;
  resource: Resource;
}

const { publication, resource } = defineProps<ResourceOverviewProps>();
const isPublishable = computed(() => "publishable" in ResourceDefinitionMap[resource.type].capabilities);
const publicUrl = computed(() => (publication ? RoutePath.View(resource.type, resource.id) : undefined));
const copyPublicLink = async () => {
  if (!publicUrl.value) return;
  await getResultAsync(() => window.navigator.clipboard.writeText(`${window.location.origin}${publicUrl.value}`)).match(
    noop,
    noop,
  );
};
</script>

<template>
  <div p-6 flex flex-col gap-4>
    <span text-h6>Essentials</span>
    <v-card>
      <v-card-text>
        <div gap-x-6 gap-y-2 grid items-center :style="{ gridTemplateColumns: 'auto 1fr' }">
          <span op-medium-emphasis>Type</span>
          <div flex gap-2 items-center>
            <v-icon size="small" :icon="ResourceDefinitionMap[resource.type].icon" />
            {{ ResourceDefinitionMap[resource.type].title }}
          </div>
          <span op-medium-emphasis>Created</span>
          <span>{{ dayjs(resource.createdAt).format("ddd, MMM D, YYYY h:mm A") }}</span>
          <span op-medium-emphasis>Updated</span>
          <span>{{ dayjs(resource.updatedAt).fromNow() }}</span>
          <template v-if="isPublishable">
            <span op-medium-emphasis>Status</span>
            <div flex gap-2 items-center>
              <template v-if="publication">
                <v-chip color="success" size="small">Published</v-chip>
                <span op-medium-emphasis>v{{ publication.publishVersion }}</span>
              </template>
              <v-chip v-else size="small">Draft</v-chip>
            </div>
          </template>
          <template v-if="publicUrl">
            <span op-medium-emphasis>Public link</span>
            <div flex flex-wrap gap-2 items-center>
              <a text-info :href="publicUrl" target="_blank" rel="noopener">{{ publicUrl }}</a>
              <StyledTooltipIconButton icon="mdi-content-copy" text="Copy link" @click="copyPublicLink" />
            </div>
          </template>
        </div>
      </v-card-text>
    </v-card>
    <slot name="summary" />
  </div>
</template>
