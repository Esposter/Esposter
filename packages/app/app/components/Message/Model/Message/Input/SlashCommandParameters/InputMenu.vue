<script setup lang="ts">
import type { SlashCommandParameter } from "@/models/message/slashCommands/SlashCommandParameter";

import { useSlashCommandStore } from "@/store/message/input/slashCommand";

interface InputMenuProps {
  activeParametersLength: number;
  hiddenParameters: SlashCommandParameter[];
  optionalHiddenParameters: SlashCommandParameter[];
  optionsLabel: string;
  requiredHiddenParameters: SlashCommandParameter[];
}

const { activeParametersLength, hiddenParameters, optionalHiddenParameters, optionsLabel, requiredHiddenParameters } =
  defineProps<InputMenuProps>();

const emit = defineEmits<{
  addParameter: [name: string];
  "navigate:previous": [];
  removeLastParameter: [];
  submit: [];
  updateParameterValue: [name: string, value: string];
}>();

const slashCommandStore = useSlashCommandStore();
const { trailingMessage } = storeToRefs(slashCommandStore);

const input = useTemplateRef<HTMLInputElement>("input");
const selectedHiddenIndex = ref(0);

watch(
  () => hiddenParameters,
  () => {
    selectedHiddenIndex.value = 0;
  },
);

defineExpose({
  focus: () => input.value?.focus(),
});
</script>

<template>
  <v-menu
    :model-value="hiddenParameters.length > 0"
    location="top"
    :close-on-content-click="false"
    @update:model-value="() => {}"
  >
    <template #activator="{ props: menuProps }">
      <span flex-1 :="menuProps">
        <input
          ref="input"
          v-model="trailingMessage"
          w-full
          b-none
          outline-none
          text-sm
          cursor-text
          :readonly="hiddenParameters.length > 0"
          :placeholder="hiddenParameters.length > 0 ? optionsLabel : ''"
          @keydown="
            (event) => {
              const target = event.target as HTMLInputElement;

              if (hiddenParameters.length === 0) {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  emit('submit');
                } else if (
                  event.key === 'ArrowLeft' &&
                  target.selectionStart === 0 &&
                  target.selectionEnd === 0 &&
                  activeParametersLength > 0
                ) {
                  event.preventDefault();
                  emit('navigate:previous');
                } else if (event.key === 'Backspace' && !trailingMessage && activeParametersLength > 0) {
                  event.preventDefault();
                  emit('removeLastParameter');
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
                if (parameter) emit('addParameter', parameter.name);
              } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                const parameter = hiddenParameters[selectedHiddenIndex] ?? hiddenParameters[0];
                if (parameter) {
                  emit('addParameter', parameter.name);
                  emit('updateParameterValue', parameter.name, event.key);
                }
              }
            }
          "
        />
      </span>
    </template>
    <v-list density="compact" min-w-48>
      <v-list-subheader v-if="requiredHiddenParameters.length > 0">REQUIRED OPTIONS</v-list-subheader>
      <v-list-item
        v-for="({ name }, i) of requiredHiddenParameters"
        :key="name"
        :active="i === selectedHiddenIndex"
        @click="emit('addParameter', name)"
      >
        <template #title>
          <span font-bold>{{ name }}</span>
        </template>
        <template #append>
          <span opacity-50 text-sm ml-4>Your {{ name }}</span>
        </template>
      </v-list-item>
      <template v-if="optionalHiddenParameters.length > 0">
        <v-list-subheader>OPTIONAL</v-list-subheader>
        <v-list-item
          v-for="({ name }, i) of optionalHiddenParameters"
          :key="name"
          :active="i + requiredHiddenParameters.length === selectedHiddenIndex"
          @click="emit('addParameter', name)"
        >
          <template #title>
            <span font-bold>{{ name }}</span>
          </template>
          <template #append>
            <span opacity-50 text-sm ml-4>Your {{ name }}</span>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>
