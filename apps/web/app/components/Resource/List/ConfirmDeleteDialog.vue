<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { useListDialogStore } from "@/store/resource/listDialog";

interface Props {
  deleteResources: (resources: Resource[]) => Promise<void>;
  resources: Resource[];
}

const { deleteResources, resources } = defineProps<Props>();
const listDialogStore = useListDialogStore();
const { deletingIds } = storeToRefs(listDialogStore);
// The resources still in the list, so a row a read took away meanwhile is not deleted from behind the dialog
const deletingResources = computed(() => resources.filter(({ id }) => deletingIds.value.includes(id)));
const isOpen = computed({
  get: () => deletingResources.value.length > 0,
  set: (newIsOpen) => {
    if (!newIsOpen) deletingIds.value = [];
  },
});
</script>

<template>
  <UiConfirmDialog
    v-if="deletingResources.length > 0"
    v-model="isOpen"
    confirm-label="Delete"
    title="Delete resources"
    :confirm="() => deleteResources(deletingResources)"
    is-optimistic
  >
    <p>
      Move
      {{
        deletingResources.length === 1
          ? deletingResources[0]?.name
          : `${deletingResources.length} ${pluralize("resource", deletingResources.length)}`
      }}
      to the recycle bin? You can restore
      {{ deletingResources.length === 1 ? "it" : "them" }} from there.
    </p>
  </UiConfirmDialog>
</template>
