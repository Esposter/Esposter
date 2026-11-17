<script setup lang="ts">
interface Props {
  // Whether the field opens for typing as it is drawn, as a choice a new row is
  isInitiallyEditing?: true | undefined;
  // What the field is for: read by a screen reader, and drawn in place of the text while the text is empty
  label: string;
  // The text the field holds, "" while it has none
  modelValue: string;
}

const { isInitiallyEditing, modelValue } = defineProps<Props>();
const emit = defineEmits<{ enter: [text: string]; "update:modelValue": [text: string] }>();
const draft = ref(modelValue);
const isEditing = ref(false);
const input = useTemplateRef("input");
// Opens the field on the text as it is held, so a restore has the held text to go back to
const startEditing = async () => {
  draft.value = modelValue;
  isEditing.value = true;
  await nextTick();
  input.value?.focus();
};
// Enter and blur both commit, and the second finds the field already closed and does nothing
const commit = () => {
  if (!isEditing.value) return;

  isEditing.value = false;
  if (draft.value !== modelValue) emit("update:modelValue", draft.value);
};
// Enter commits the typed text, then reports the key so the list it sits in can act on it
const submit = () => {
  commit();
  emit("enter", draft.value);
};
// Escape closes the field on the held text, which the draft is reset to, so nothing is written
const restore = () => {
  draft.value = modelValue;
  isEditing.value = false;
};
onMounted(() => {
  if (isInitiallyEditing) startEditing();
});
</script>

<template>
  <input
    v-if="isEditing"
    ref="input"
    v-model="draft"
    :aria-label="label"
    type="text"
    bg-transparent
    w-full
    @blur="commit()"
    @keydown.enter.prevent="submit()"
    @keydown.escape.prevent="restore()"
  />
  <span
    v-else
    tabindex="0"
    :aria-label="label"
    cursor-text
    :text-muted="!modelValue || undefined"
    @click="startEditing()"
    @keydown.enter.prevent="startEditing()"
  >
    {{ modelValue || label }}
  </span>
</template>
