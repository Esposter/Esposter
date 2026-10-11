<script setup lang="ts">
interface Props {
  description: string;
  title: string;
}

const { description, title } = defineProps<Props>();
const descriptionId = useId();
defineSlots<{ default: (props: { descriptionId: string }) => VNode }>();
</script>

<!-- One permission on a row: its name, the sentence saying what it allows in full, and the control at the end. The
     control is handed the description's id so it can name what it allows -->
<template>
  <div py-2 flex gap-4 items-center>
    <div flex flex-1 flex-col min-w-0>
      <span>{{ title }}</span>
      <span :id="descriptionId" text-sm text-muted>{{ description }}</span>
    </div>
    <slot :description-id />
  </div>
</template>
