<script setup lang="ts">
import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { UiMenuItem } from "#src/models/ui/UiMenuItem";
import type { MimeCategory } from "@esposter/db-schema";

import { KIBIBYTE } from "#shared/services/app/constants";
import { getMimeCategory } from "@esposter/db-schema";

interface Props {
  // The kind of file the picker lists, read off the type each file's upload declared
  category: MimeCategory;
  resourceId: string;
  type: FileAssetsResourceType;
}
const { category, resourceId, type } = defineProps<Props>();
// The address of the file chosen, which the field it is drawn in writes as the source
const emit = defineEmits<{ update: [src: string] }>();
const getResourceRouter = useResourceRouter();
// The files the resource holds of this kind, read as the picker mounts. The list is absent until the read settles
const { data: items } = useQuery(async () => {
  const files = await getResourceRouter(type).readResourceFiles.query({ id: resourceId });
  return files
    .filter(({ mimetype }) => getMimeCategory(mimetype) === category)
    .map<UiMenuItem<string>>(({ mimetype, size, url }) => ({
      title: `${mimetype}, ${Math.ceil(size / KIBIBYTE)} KB`,
      value: url,
    }));
});
</script>

<template>
  <!-- The picker keeps no choice, so each pick emits its file even when it was the last one picked -->
  <UiSelect
    :is-disabled="!items"
    :items="items ?? []"
    :label="`Choose ${category.toLowerCase()}`"
    :model-value="''"
    @update:model-value="(src) => emit('update', src)"
  />
</template>
