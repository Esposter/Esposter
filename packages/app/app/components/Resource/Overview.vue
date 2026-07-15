<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { getResultAsync, noop, RoutePath } from "@esposter/shared";

interface ResourceOverviewProps {
  isLoading?: boolean;
  publication?: ResourcePublication;
  resource: Resource;
}

const { isLoading, publication, resource } = defineProps<ResourceOverviewProps>();
// Essentials takes extra rows from the type (the grid owns the two columns, so a slot renders
// A label/value pair); summary takes whole cards below the card
defineSlots<{ essentials?: () => VNode; summary?: () => VNode }>();
const getResourceMutations = useResourceMutations();
const isPublishable = computed(() => "publishable" in ResourceDefinitionMap[resource.type].capabilities);
const publicUrl = computed(() => (publication ? RoutePath.View(resource.type, resource.id) : undefined));
// Best-effort telemetry, so a failed count leaves the row out rather than erroring the whole blade
const viewCount = ref<number>();
watchImmediate(
  () => resource.id,
  async (id) => {
    const { readResourceViewCount } = getResourceMutations(resource.type);
    if (!readResourceViewCount) return;
    viewCount.value = await getResultAsync(() => readResourceViewCount({ id })).unwrapOr(undefined);
  },
);
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
    <StyledSkeleton v-if="isLoading" type="article" />
    <v-card v-else>
      <v-card-text>
        <div gap-x-6 gap-y-2 grid items-center :style="{ gridTemplateColumns: 'auto 1fr' }">
          <span op-medium-emphasis>Type</span>
          <div flex gap-2 items-center>
            <v-icon size="small" :icon="ResourceDefinitionMap[resource.type].icon" />
            {{ ResourceDefinitionMap[resource.type].title }}
          </div>
          <span op-medium-emphasis>Created</span>
          <span>{{ dayjs(resource.createdAt).format(RESOURCE_DATE_FORMAT) }}</span>
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
          <template v-if="publication && viewCount !== undefined">
            <span op-medium-emphasis>Views</span>
            <div flex gap-2 items-center>
              <v-icon size="small" icon="mdi-eye-outline" />
              <span>{{ viewCount }}</span>
            </div>
          </template>
          <template v-if="publicUrl">
            <span op-medium-emphasis>Public link</span>
            <div flex flex-wrap gap-2 items-center>
              <NuxtLink :to="publicUrl" external text-info target="_blank">{{ publicUrl }}</NuxtLink>
              <StyledTooltipIconButton icon="mdi-content-copy" text="Copy link" @click="copyPublicLink" />
            </div>
          </template>
          <slot name="essentials" />
        </div>
      </v-card-text>
    </v-card>
    <slot name="summary" />
  </div>
</template>
