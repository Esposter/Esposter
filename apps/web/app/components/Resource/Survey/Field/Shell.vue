<script setup lang="ts">
interface Props {
  // What the control is for, drawn under the title and read as the control's description
  description: string;
  // The message the runner gives the question, "" while it has none, drawn under the control and marking it invalid
  error: string;
  isRequired: boolean;
  title: string;
}

defineSlots<{ default: (props: { describedBy?: string }) => VNode }>();
const { description, error, isRequired, title } = defineProps<Props>();
const id = useId();
const descriptionId = `${id}-description`;
const errorId = `${id}-error`;
// The description and the error a control is described by, so a reader of speech hears both with it
const describedBy = computed(
  () => [description && descriptionId, error && errorId].filter(Boolean).join(" ") || undefined,
);
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>
      {{ title }}
      <UiRequiredMark v-if="isRequired" />
    </span>
    <span v-if="description" :id="descriptionId" text-sm text-muted>{{ description }}</span>
    <slot :described-by />
    <span v-if="error" :id="errorId" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
