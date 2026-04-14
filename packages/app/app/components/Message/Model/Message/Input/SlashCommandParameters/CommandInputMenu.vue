<script setup lang="ts">
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";

import { useSlashCommandStore } from "@/store/message/input/slashCommand";

interface CommandInputMenuProps {
  isFocused?: boolean;
  items: SlashCommand[];
}

const { isFocused, items } = defineProps<CommandInputMenuProps>();
const emit = defineEmits<{
  blur: [];
  delete: [];
  focus: [];
  "navigate:next": [];
  "select:command": [command: SlashCommand];
}>();
const modelValue = defineModel<string>({ required: true });
const slashCommandStore = useSlashCommandStore();
const { pendingSlashCommand } = storeToRefs(slashCommandStore);
const isInputFocused = ref(false);
const isMenuFocused = ref(false);
const isOpen = computed({
  get: () =>
    (isInputFocused.value || isMenuFocused.value) &&
    modelValue.value?.toLowerCase() !== pendingSlashCommand.value?.type?.toLowerCase(),
  set: (value) => {
    isInputFocused.value = value;
  },
});
const slashCommandList = useTemplateRef("slashCommandList");
</script>

<template>
  <v-menu
    :model-value="isOpen"
    location="top"
    offset="15"
    :close-on-content-click="false"
    @update:model-value="() => {}"
  >
    <template #activator="{ props: menuProps }">
      <MessageModelMessageInputSlashCommandParametersCommandInput
        v-model="modelValue"
        :is-focused
        :="menuProps"
        @focus="
          () => {
            isInputFocused = true;
            emit('focus');
          }
        "
        @blur="
          () => {
            isInputFocused = false;
            emit('blur');
          }
        "
        @keydown="slashCommandList?.onKeyDown({ event: $event })"
        @navigate:next="emit('navigate:next')"
        @delete="emit('delete')"
      />
    </template>
    <div @mousedown.prevent @focusin="isMenuFocused = true" @focusout="isMenuFocused = false">
      <MessageModelMessageSlashCommandList
        ref="slashCommandList"
        :items
        :query="modelValue"
        :command="(command) => emit('select:command', command)"
      />
    </div>
  </v-menu>
</template>
