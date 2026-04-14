<script setup lang="ts">
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";

import MessageModelMessageSlashCommandList from "@/components/Message/Model/Message/SlashCommandList.vue";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

interface CommandInputMenuProps {
  items: SlashCommand[];
}

const { items } = defineProps<CommandInputMenuProps>();
const emit = defineEmits<{
  "navigate:next": [];
  remove: [];
  "select:command": [command: SlashCommand];
}>();
const modelValue = defineModel<string>({ required: true });
const slashCommandStore = useSlashCommandStore();
const { pendingSlashCommand } = storeToRefs(slashCommandStore);
const isCommandInputFocused = ref(false);
const isOpen = computed({
  get: () => isCommandInputFocused.value && modelValue.value !== pendingSlashCommand.value?.type,
  set: (value) => {
    isCommandInputFocused.value = value;
  },
});
const commandInput = useTemplateRef("commandInput");
const slashCommandList = useTemplateRef<InstanceType<typeof MessageModelMessageSlashCommandList>>("slashCommandList");

defineExpose({ focus: () => commandInput.value?.focus() });
</script>

<template>
  <v-menu
    v-model="isOpen"
    :close-on-content-click="false"
    location="top"
    offset="15"
    :min-width="400"
    @update:model-value="() => {}"
  >
    <template #activator="{ props: menuProps }">
      <MessageModelMessageInputSlashCommandParametersCommandInput
        ref="commandInput"
        v-model="modelValue"
        :="menuProps"
        @focus="isCommandInputFocused = true"
        @blur="isCommandInputFocused = false"
        @keydown="slashCommandList?.onKeyDown({ event: $event })"
        @navigate:next="emit('navigate:next')"
        @remove="emit('remove')"
      />
    </template>
    <MessageModelMessageSlashCommandList
      ref="slashCommandList"
      :items
      :query="modelValue"
      :command="(command) => emit('select:command', command)"
    />
  </v-menu>
</template>
