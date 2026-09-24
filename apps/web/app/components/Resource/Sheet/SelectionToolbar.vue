<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { capitalize } from "@esposter/shared";

interface Props {
  label: string;
}

const { label } = defineProps<Props>();
const selectedIds = defineModel<string[]>({ required: true });
const emit = defineEmits<{ delete: [ids: string[]] }>();
const isDeleteOpen = ref(false);
const selectedLabel = computed(() => `${selectedIds.value.length} ${pluralize(label, selectedIds.value.length)}`);
</script>

<template>
  <div role="toolbar" :aria-label="`Selected ${pluralize(label, 2)}`" flex gap-2 items-center>
    <span text-muted truncate>{{ selectedIds.length }} selected</span>
    <UiButton :variant="UiButtonVariant.Danger" @click="isDeleteOpen = true">Delete</UiButton>
    <UiButton :variant="UiButtonVariant.Quiet" ml-a @click="selectedIds = []">Clear</UiButton>
    <UiConfirmDialog
      v-model="isDeleteOpen"
      confirm-label="Delete"
      :title="`Delete ${capitalize(selectedLabel)}`"
      @confirm="
        (onComplete) => {
          emit('delete', selectedIds);
          selectedIds = [];
          onComplete();
        }
      "
    >
      <p>Delete {{ selectedLabel }}? Undo brings them back.</p>
    </UiConfirmDialog>
  </div>
</template>
