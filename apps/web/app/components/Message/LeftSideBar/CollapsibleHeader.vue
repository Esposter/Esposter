<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  title: string;
}

// A section's heading row, as Discord's category rows are: the disclosure and the title in one button, and what acts on
// The whole section beside it rather than inside it. The rows it hides are the list's own, which reads this model
defineSlots<{ append?: () => VNode }>();
const { title } = defineProps<Props>();
const isCollapsed = defineModel<boolean>("collapsed", { required: true });
</script>

<template>
  <div mt-2 flex gap-1 items-center>
    <button :aria-expanded="!isCollapsed" type="button" ui-item flex-1 @click="isCollapsed = !isCollapsed">
      <UiItemContent :title>
        <template #mark>
          <UiIcon :class="isCollapsed ? undefined : 'rotate-90'" :meaning="UiIconMeaning.Disclosure" />
        </template>
      </UiItemContent>
    </button>
    <slot name="append" />
  </div>
</template>
