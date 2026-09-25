<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  label: string;
}

const { label } = defineProps<Props>();
const selectedIds = defineModel<string[]>({ required: true });
const emit = defineEmits<{ delete: [ids: string[]] }>();
</script>

<template>
  <div role="toolbar" :aria-label="`Selected ${pluralize(label, 2)}`" flex gap-2 items-center>
    <span text-muted truncate>{{ selectedIds.length }} selected</span>
    <!-- It asks nothing first: the toolbar's Undo brings the selection back -->
    <UiButton
      :variant="UiButtonVariant.Danger"
      @click="
        () => {
          emit('delete', selectedIds);
          selectedIds = [];
        }
      "
    >
      Delete
    </UiButton>
    <UiButton :variant="UiButtonVariant.Quiet" ml-a @click="selectedIds = []">Clear</UiButton>
  </div>
</template>
