<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { checkIsCaretAtStart } from "@/util/dom/checkIsCaretAtStart";

interface Props {
  isFocused?: boolean;
}

const { isFocused } = defineProps<Props>();
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
const { activeParameters, hiddenParameters, selectedHiddenIndex, trailingMessage } = storeToRefs(slashCommandStore);
const { selectNextHiddenParameter, selectPreviousHiddenParameter } = slashCommandStore;
const input = useTemplateRef("input");
const optionsLabel = computed(
  () => `+${hiddenParameters.value.length} ${pluralize("option", hiddenParameters.value.length)}`,
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
      outline-none
      b-none
      bg-transparent
      w-full
      cursor-text
      text-body-medium
      :readonly="hiddenParameters.length > 0"
      :placeholder="hiddenParameters.length > 0 ? optionsLabel : ''"
      @focus="emit('focus')"
      @blur="emit('blur')"
      @keydown="
        (event) => {
          const target = event.target as HTMLInputElement;

          if (event.key === 'ArrowLeft' && checkIsCaretAtStart(target)) {
            event.preventDefault();
            emit('navigate:previous');
            return;
          }

          if (event.key === 'Backspace' && !trailingMessage) {
            event.preventDefault();
            if (activeParameters.length > 0) emit('deleteLastParameter');
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
            selectPreviousHiddenParameter();
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectNextHiddenParameter();
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
