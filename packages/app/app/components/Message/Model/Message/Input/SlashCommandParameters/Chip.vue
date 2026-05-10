<script setup lang="ts">
import { REQUIRED_ERROR_MESSAGE } from "@/services/message/slashCommands/constants";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { normalizeString } from "@esposter/shared";

interface ChipProps {
  autofocus?: boolean;
  isFocused?: boolean;
  isRequired: boolean;
  name: string;
}

const modelValue = defineModel<string>({ default: "" });
const { isFocused, isRequired, name } = defineProps<ChipProps>();
const emit = defineEmits<{
  blur: [];
  delete: [];
  focus: [];
  "navigate:next": [];
  "navigate:previous": [];
  submit: [];
}>();
const slashCommandStore = useSlashCommandStore();
const { errors } = storeToRefs(slashCommandStore);
const { setErrors } = slashCommandStore;
const input = useTemplateRef("input");
const isError = computed(() => {
  const error = errors.value.find((e) => e.id === name);
  return error && error.messages.length > 0;
});
const { trigger } = watchTriggerable(
  () => isFocused,
  (newIsFocused) => {
    if (newIsFocused) input.value?.focus();
  },
);

onMounted(() => {
  trigger();
});
</script>

<template>
  <div
    :class="isError ? ['b-error'] : ['b-border', 'focus-within:b-info']"
    b="[1.5px]"
    inline-flex
    items-center
    gap-1.5
    rd
    bg-border
    px-2
    py-1
    overflow-hidden
  >
    <span
      :class="isError ? 'text-error' : ''"
      my--1
      ml--2
      flex
      items-center
      self-stretch
      text-sm
      font-bold
      pl-2
      pr-1
      py-1
      bg-background
    >
      {{ name }}
    </span>
    <input
      ref="input"
      v-model="modelValue"
      b-none
      text-sm
      color-inherit
      outline-none
      field-sizing-content
      bg-transparent
      :autofocus
      @focus="emit('focus')"
      @blur="emit('blur')"
      @update:model-value="setErrors(name, isRequired && !normalizeString($event) ? [REQUIRED_ERROR_MESSAGE] : [])"
      @keydown.enter.prevent="emit('submit')"
      @keydown.delete="!modelValue && emit('delete')"
      @keydown.left.exact="
        (event) => {
          const target = event.target as HTMLInputElement;
          if (target.selectionStart === 0 && target.selectionEnd === 0) {
            event.preventDefault();
            emit('navigate:previous');
          }
        }
      "
      @keydown.right.exact="
        (event) => {
          const target = event.target as HTMLInputElement;
          if (target.selectionStart === target.value.length && target.selectionEnd === target.value.length) {
            event.preventDefault();
            emit('navigate:next');
          }
        }
      "
    />
  </div>
</template>
