<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiToken } from "@/models/ui/UiToken";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { useResourceStore } from "@/store/resource";
import { RoutePath } from "@esposter/shared";

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
const isPublishable = computed(() => checkHasCapability(resource.type, "publishable"));
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
// The page is keyed by resource id, so this instance only ever describes one resource — the count is
// Read once rather than watching an id that cannot change underneath it. A failed count leaves the row out
// Only a published resource has views, and only its row renders the count — reading it for a draft spends
// A round trip on a number nothing displays. The capability is what makes the procedure reachable, so the
// Guard and the availability are one fact
// Called on the local `type` rather than read off `isPublishable`, because it is the type guard that narrows
// The router to the one carrying `readResourceViewCount`
const { data: viewCount } = useQuery(() => {
  const { type } = resource;
  if (!publication.value || !checkHasCapability(type, "publishable")) return Promise.resolve(undefined);

  const { readResourceViewCount } = getResourceRouter(type);
  return readResourceViewCount.query({ id: resource.id });
});
</script>

<template>
  <div p-4 flex flex-col gap-4 ui-body>
    <h2 ui-heading>Essentials</h2>
    <div v-if="isPending" flex flex-col gap-2>
      <UiSkeleton v-for="index of 5" :key="index" h-6 w="1/2" />
    </div>
    <div v-else gap-x-6 gap-y-2 grid items-center grid-cols="[auto_1fr]">
      <span text-muted>Type</span>
      <div flex gap-2 items-center>
        <span :class="ResourceDefinitionMap[resource.type].icon" aria-hidden="true" size-5 />
        {{ ResourceDefinitionMap[resource.type].title }}
      </div>
      <span text-muted>Created</span>
      <div><NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="resource.createdAt" /></div>
      <span text-muted>Updated</span>
      <div><NuxtTime :datetime="resource.updatedAt" relative /></div>
      <template v-if="isPublishable || hasRestorePoint">
        <span text-muted>Status</span>
        <div flex flex-wrap gap-2 items-center>
          <template v-if="publication && isPublishable">
            <UiChip :token="UiToken.Success">Published</UiChip>
            <span text-muted>v{{ publication.publishVersion }}</span>
            <!-- The Azure-portal question this row exists to answer: is what I am looking at what the world
                 sees. A published resource whose draft has moved says so rather than leaving it to be worked
                 out from the two dates above -->
            <span v-if="hasUnpublishedChanges" flex gap-1 items-center>
              <span text-warning flex><UiIcon :meaning="UiIconMeaning.Warning" /></span>
              Draft changes not published
            </span>
            <span v-else text-muted>Up to date</span>
          </template>
          <UiChip v-else-if="isPublishable" :token="UiToken.Muted">Draft</UiChip>
          <span v-if="hasRestorePoint" text-muted>Restore point available</span>
        </div>
      </template>
      <template v-if="publication && viewCount !== undefined">
        <span text-muted>Views</span>
        <div flex gap-2 items-center>
          <UiIcon :meaning="UiIconMeaning.Show" />
          {{ viewCount }}
        </div>
      </template>
      <template v-if="publicUrl">
        <span text-muted>Public link</span>
        <div flex flex-wrap gap-2 items-center>
          <NuxtLink :to="publicUrl" external text-info hover:underline target="_blank">{{ publicUrl }}</NuxtLink>
          <UiIconButton
            label="Copy link"
            :meaning="UiIconMeaning.Copy"
            :variant="UiButtonVariant.Quiet"
            @click="copyLinkToClipboard(publicUrl)"
          />
        </div>
      </template>
      <span text-muted>Tags</span>
      <div flex flex-wrap gap-2 items-center>
        <UiChip v-for="[tagName, tagValue] of tagRows" :key="tagName">
          {{ tagValue ? `${tagName}: ${tagValue}` : tagName }}
        </UiChip>
        <span v-if="tagRows.length === 0" text-muted>None</span>
        <!-- The only way into the tags editor -->
        <UiButton @click="isTagsEditorOpen = true">
          <UiIcon :meaning="UiIconMeaning.Edit" />
          Edit
        </UiButton>
      </div>
      <slot name="essentials" />
    </div>
    <slot name="summary" />
    <ResourceTagsEditorDialog
      v-if="isTagsEditorOpen"
      v-model="isTagsEditorOpen"
      :tags="resource.tags"
      :update-tags="updateResourceTags"
    />
  </div>
</template>
