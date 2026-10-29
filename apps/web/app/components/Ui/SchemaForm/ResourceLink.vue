<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/schemaForm/UiSchemaFormRendererProps";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import ResourceLinkSelect from "@/components/Resource/Link/Select.vue";
import { getUnpublishedResourceMessage } from "@/services/resource/getUnpublishedResourceMessage";
import { getResourceLinkSource } from "@/services/resource/link/getResourceLinkSource";
import { MAX_READ_LIMIT } from "@esposter/shared";

interface Props extends UiSchemaFormRendererProps {}
// JSON Forms derives whether a field is enabled or read only when the form leaves them unset, which a boolean prop
// Would read as false
const props = withDefaults(defineProps<Props>(), { enabled: undefined, readonly: undefined });
const { change, control } = useSchemaFormControl(props);
const { $trpc } = useNuxtApp();
// The renderer is ranked only for a field whose link type has a source, so this is set wherever it is drawn
const source = computed(() => getResourceLinkSource(control.value.schema));
// A link holds its unbound placeholder until one is chosen, which names no resource and is shown as none
const boundId = computed<string>(() =>
  control.value.data === source.value?.unboundId ? "" : control.value.data || "",
);
// The owner's resources of the link's type in one page, published alone where the type's list is. Absent until read,
// Since a binding cannot be told missing before then
const { data: listedResources } = useQuery(async () => {
  const linkSource = source.value;
  if (!linkSource) return undefined;
  const { hasMore, items } = await $trpc[linkSource.router].readResources.query({
    isPublished: linkSource.isPublishedOnly ? true : undefined,
    limit: MAX_READ_LIMIT,
  });
  return {
    hasMore,
    items: items.map<UiSelectItem<string>>(({ id, name }) => ({ meaning: linkSource.meaning, title: name, value: id })),
  };
});
// A bound resource is read only where its type's list leaves published ones out, to tell an unpublished one from one
// That is gone. A read that fails is the gone case, so its failure is left to the select's missing message
const { data: boundResource, refresh: refreshBoundResource } = useQuery(
  () => $trpc.resource.readResource.query({ id: boundId.value }),
  { isInlineError: true, isLazy: true },
);
watchImmediate(boundId, (id) => {
  if (id && source.value?.isPublishedOnly) refreshBoundResource();
});
// Set only while the bound resource is read and is not published, since the list cannot offer it then
const unpublishedResource = computed(() => {
  const resource = boundResource.value;
  return resource && resource.id === boundId.value && !resource.publication ? resource : undefined;
});
</script>

<!-- A field that names another resource, drawn as the select of that resource's type, with what its binding says beside it -->
<template>
  <ResourceLinkSelect
    :is-required="control.required"
    :is-unpublished="Boolean(unpublishedResource)"
    :label="control.label"
    :model-value="boundId"
    :resources="listedResources"
    @update:model-value="change($event)"
  >
    <template #warning>
      <span v-if="unpublishedResource" role="alert" text-sm text-error>
        {{ getUnpublishedResourceMessage(unpublishedResource.name) }}
      </span>
      <span v-else-if="source && listedResources?.items.length === 0" role="status" text-sm text-muted>
        {{ source.emptyMessage }}
      </span>
    </template>
  </ResourceLinkSelect>
</template>
