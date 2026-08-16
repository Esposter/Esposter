<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { hasCapability } from "#shared/services/resource/hasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { useResourceStore } from "@/store/resource";
import { getResultAsync, RoutePath } from "@esposter/shared";

interface ResourceOverviewProps {
  resource: Resource;
}

const { resource } = defineProps<ResourceOverviewProps>();
// Essentials takes extra rows from the type (the grid owns the two columns, so a slot renders
// A label/value pair); summary takes whole cards below the card
defineSlots<{ essentials?: () => VNode; summary?: () => VNode }>();
const getResourceRouter = useResourceRouter();
const resourceStore = useResourceStore();
const { isLoading, publication } = storeToRefs(resourceStore);
const { updateResourceTags } = resourceStore;
const isTagsEditorOpen = ref(false);
const tagRows = computed(() => Object.entries(resource.tags));
const isPublishable = computed(() => hasCapability(resource.type, "publishable"));
const publicUrl = computed(() => (publication.value ? RoutePath.View(resource.type, resource.id) : undefined));
// Best-effort telemetry, so a failed count leaves the row out rather than erroring the whole blade
// The page is keyed by resource id, so this instance only ever describes one resource — the count is
// Read once on mount rather than watching an id that cannot change underneath it
const viewCount = ref<number>();
onMounted(async () => {
  // Only a published resource has views, and only its row renders the count — reading it for a draft spends
  // A round trip on a number nothing displays. The capability is what makes the procedure reachable, so the
  // Guard and the availability are one fact
  // Called on the local `type` rather than read off `isPublishable`, because it is the type guard that narrows
  // The router to the one carrying `readResourceViewCount`
  const { type } = resource;
  if (!publication.value || !hasCapability(type, "publishable")) return;

  const { readResourceViewCount } = getResourceRouter(type);
  viewCount.value = await getResultAsync(() => readResourceViewCount.query({ id: resource.id })).unwrapOr(undefined);
});
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
              <StyledTooltipIconButton
                icon="mdi-content-copy"
                text="Copy link"
                @click="copyLinkToClipboard(publicUrl)"
              />
            </div>
          </template>
          <span op-medium-emphasis>Tags</span>
          <div flex flex-wrap gap-2 items-center>
            <v-chip v-for="[tagName, tagValue] of tagRows" :key="tagName" size="small">
              {{ tagValue ? `${tagName}: ${tagValue}` : tagName }}
            </v-chip>
            <span v-if="tagRows.length === 0" op-medium-emphasis>None</span>
            <!-- The only way into the tags editor, and a colourless flat button is transparent here, so it read
                 as a word sitting beside the chips rather than as the control they are edited from -->
            <StyledButton
              :button-props="{ prependIcon: 'mdi-pencil', size: 'small', text: 'Edit' }"
              @click="isTagsEditorOpen = true"
            />
          </div>
          <slot name="essentials" />
        </div>
      </v-card-text>
    </v-card>
    <slot name="summary" />
    <ResourceTagsEditorDialog
      v-if="isTagsEditorOpen"
      v-model="isTagsEditorOpen"
      :tags="resource.tags"
      :update-tags="updateResourceTags"
    />
  </div>
</template>
