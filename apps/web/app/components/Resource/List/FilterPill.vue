<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  isRemovable?: true;
  label: string;
  value: string;
}

defineSlots<{ default: (props: { close: () => void }) => VNode }>();
const { isRemovable, label, value } = defineProps<Props>();
const emit = defineEmits<{ remove: [] }>();
</script>

<!-- A filter reads as what it holds, "Status: all", opens a panel to change it, and is taken off by its own mark -->
<template>
  <div pl-1 flex items-center ui-sunk ui-pill>
    <UiPopover :label="`${label}: ${value}`" :variant="UiButtonVariant.Quiet" flex gap-1 items-center>
      <template #trigger>
        <span text-muted>{{ label }}:</span> {{ value }}
        <UiIcon :meaning="UiIconMeaning.Dropdown" />
      </template>
      <template #default="{ close }">
        <slot :close />
      </template>
    </UiPopover>
    <UiIconButton
      v-if="isRemovable"
      :label="`Remove the ${label} filter`"
      :meaning="UiIconMeaning.Remove"
      :variant="UiButtonVariant.Quiet"
      @click="emit('remove')"
    />
  </div>
</template>
