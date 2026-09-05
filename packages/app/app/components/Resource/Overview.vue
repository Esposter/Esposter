<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { useResourceStore } from "@/store/resource";
import { getResultAsync, RoutePath } from "@esposter/shared";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
// Essentials takes extra rows from the type (the grid owns the two columns, so a slot renders
// A label/value pair); summary takes whole cards below the card
defineSlots<{ essentials?: () => VNode; summary?: () => VNode }>();
const getResourceRouter = useResourceRouter();
const resourceStore = useResourceStore();
const { isPending, publication } = storeToRefs(resourceStore);
const { updateResourceTags } = resourceStore;
const isTagsEditorOpen = ref(false);
const tagRows = computed(() => Object.entries(resource.tags));
const isPublishable = computed(() => hasCapability(resource.type, "publishable"));
// The publication records the `contentVersion` it was published from, so whether the draft has moved since is
// A comparison rather than a guess off two timestamps — `updatedAt` moves for a rename and a tag edit too, and
// The publish itself writes nothing to the resource row for it to be compared against
// Every type has revisions, so the Status row is not the publishable types' alone: it says a version exists to
// Return to, once one does. The version history panel is where they are chosen, so the number itself is never
// Rendered — an owner picks a version by its time and its label, never by its ordinal
const hasRestorePoint = computed(() => resource.revisionVersion > 0);
const hasUnpublishedChanges = computed(() =>
  publication.value ? resource.contentVersion > publication.value.publishedContentVersion : false,
);
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
    <span text-title-large>Essentials</span>
    <StyledSkeleton v-if="isPending" type="article" />
    <v-card v-else>
      <v-card-text>
        <div gap-x-6 gap-y-2 grid items-center grid-cols="[auto_1fr]">
          <span op-medium-emphasis>Type</span>
          <div flex gap-2 items-center>
            <v-icon size="small" :icon="ResourceDefinitionMap[resource.type].icon" />
            {{ ResourceDefinitionMap[resource.type].title }}
          </div>
          <span op-medium-emphasis>Created</span>
          <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="resource.createdAt" />
          <span op-medium-emphasis>Updated</span>
          <NuxtTime :datetime="resource.updatedAt" relative />
          <template v-if="isPublishable || hasRestorePoint">
            <span op-medium-emphasis>Status</span>
            <div flex flex-wrap gap-2 items-center>
              <template v-if="publication && isPublishable">
                <v-chip color="success" size="small">Published</v-chip>
                <span op-medium-emphasis>v{{ publication.publishVersion }}</span>
                <!-- The Azure-portal question this row exists to answer: is what I am looking at what the world
                     sees. A published resource whose draft has moved says so rather than leaving it to be worked
                     out from the two dates above -->
                <span v-if="hasUnpublishedChanges" flex gap-1 items-center>
                  <v-icon color="warning" icon="mdi-alert-outline" size="small" />
                  Draft changes not published
                </span>
                <span v-else op-medium-emphasis>Up to date</span>
              </template>
              <v-chip v-else-if="isPublishable" size="small">Draft</v-chip>
              <span v-if="hasRestorePoint" op-medium-emphasis>Restore point available</span>
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
            <!-- The only way into the tags editor. A colourless flat button is transparent here and reads as a
                 Word sitting beside the chips rather than as the control they are edited from -->
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
