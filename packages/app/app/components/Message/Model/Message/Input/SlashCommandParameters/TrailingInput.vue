<script setup lang="ts">
import type { SlashCommandParameter } from "@/models/message/slashCommands/SlashCommandParameter";

import { useSlashCommandStore } from "@/store/message/input/slashCommand";

interface TrailingInputProps {
  activeParametersLength: number;
  hiddenParameters: SlashCommandParameter[];
  isFocused?: boolean;
}

const { activeParametersLength, hiddenParameters, isFocused } = defineProps<TrailingInputProps>();
const emit = defineEmits<{
  blur: [];
  collapse: [];
  createParameter: [name: string];
  deleteLastParameter: [];
  focus: [];
  "navigate:previous": [];
  submit: [];
  updateParameterValue: [name: string, value: string];
}>();

const slashCommandStore = useSlashCommandStore();
const { selectedHiddenIndex, trailingMessage } = storeToRefs(slashCommandStore);
const input = useTemplateRef("input");
const optionsLabel = computed(
  () => `+${hiddenParameters.length} ${hiddenParameters.length === 1 ? "option" : "options"}`,
);

watch(
  () => isFocused,
  (newIsFocused) => {
    if (newIsFocused) input.value?.focus();
  },
);
</script>

<template>
  <span flex-1>
    <input
      ref="input"
      v-model="trailingMessage"
      w-full
      bg-transparent
      b-none
      outline-none
      text-sm
      cursor-text
      :readonly="hiddenParameters.length > 0"
      :placeholder="hiddenParameters.length > 0 ? optionsLabel : ''"
      @focus="emit('focus')"
      @blur="emit('blur')"
      @keydown="
        (event) => {
          const target = event.target as HTMLInputElement;

          if (event.key === 'ArrowLeft' && target.selectionStart === 0 && target.selectionEnd === 0) {
            event.preventDefault();
            emit('navigate:previous');
            return;
          }

          if (event.key === 'Backspace' && !trailingMessage) {
            event.preventDefault();
            if (activeParametersLength > 0) emit('deleteLastParameter');
            else emit('collapse');
            return;
          }

          if (hiddenParameters.length === 0) {
            if (event.key === 'Enter') {
              event.preventDefault();
              emit('submit');
            }
            return;
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedHiddenIndex = Math.max(0, selectedHiddenIndex - 1);
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectedHiddenIndex = Math.min(hiddenParameters.length - 1, selectedHiddenIndex + 1);
          } else if (event.key === 'Enter') {
            event.preventDefault();
            const parameter = hiddenParameters[selectedHiddenIndex] ?? hiddenParameters[0];
            if (parameter) emit('createParameter', parameter.name);
          } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            const parameter = hiddenParameters[selectedHiddenIndex] ?? hiddenParameters[0];
            if (parameter) {
              emit('createParameter', parameter.name);
              emit('updateParameterValue', parameter.name, event.key);
            }
          }
        }
      "
    />
  </span>
</template>
