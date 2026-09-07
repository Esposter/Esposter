<script setup lang="ts">
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";

import { SlashCommandDefinitions } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

const slashCommandStore = useSlashCommandStore();
const { activeParameters, focusedIndex, lastAddedParameterName, parameterValues, pendingSlashCommand } =
  storeToRefs(slashCommandStore);
const {
  collapseToText,
  createParameter,
  deleteParameter: baseDeleteParameter,
  setPendingSlashCommand,
} = slashCommandStore;
const submit = useSubmitSlashCommand();
const editedCommandType = ref(pendingSlashCommand.value?.type ?? "");

watch(pendingSlashCommand, (newPendingSlashCommand) => {
  if (newPendingSlashCommand) editedCommandType.value = newPendingSlashCommand.type;
});

const deleteParameter = (index: number) => {
  const name = activeParameters.value[index]?.name;
  if (!name) return;

  baseDeleteParameter(name);
  focus(index - 1);
};
const commandNavigateNext = async () => {
  const newSlashCommand = SlashCommandDefinitions.find(
    ({ type }) => type.toLowerCase() === editedCommandType.value.toLowerCase(),
  );
  if (newSlashCommand && newSlashCommand.type !== pendingSlashCommand.value?.type) await selectCommand(newSlashCommand);
  else if (activeParameters.value.length > 0) focus(0);
};
const selectCommand = async (slashCommand: SlashCommand) => {
  setPendingSlashCommand(slashCommand);
  if (slashCommand.parameters.length === 0) await submit();
  else focus(0);
};
const navigatePrevious = (index: number) => {
  focusedIndex.value = index - 1;
};
const focus = (index: number) => {
  focusedIndex.value = index;
};
const blur = (index: number) => {
  if (focusedIndex.value === index) focusedIndex.value = -2;
};
const updateParameterValue = (name: string, value: string) => {
  parameterValues.value[name] = value;
};
const deleteLastParameter = () => {
  const lastIndex = activeParameters.value.length - 1;
  if (lastIndex >= 0) deleteParameter(lastIndex);
};

onKeyStroke("Escape", () => collapseToText());
onKeyStroke("Backspace", () => {
  if (focusedIndex.value === -1) collapseToText();
});
</script>

<template>
  <div v-if="pendingSlashCommand" w-full>
    <StyledCard>
      <div px-4 pb-2 pt-3 flex gap-2 items-center>
        <MessageModelMessageInputSlashCommandParametersCommandInput
          v-model="editedCommandType"
          :is-focused="focusedIndex === -1"
          @navigate:next="commandNavigateNext"
          @delete="collapseToText"
          @focus="focus(-1)"
          @blur="blur(-1)"
        />
        <template v-for="({ isRequired, name }, index) of activeParameters" :key="name">
          <MessageModelMessageInputSlashCommandParametersChip
            :is-required
            :name
            :autofocus="lastAddedParameterName === name || (!lastAddedParameterName && index === 0)"
            :is-focused="focusedIndex === index"
            :model-value="parameterValues[name] ?? ''"
            @update:model-value="updateParameterValue(name, $event)"
            @delete="deleteParameter(index)"
            @submit="submit"
            @navigate:previous="navigatePrevious(index)"
            @navigate:next="focusedIndex = index + 1"
            @focus="focus(index)"
            @blur="blur(index)"
          />
        </template>
        <MessageModelMessageInputSlashCommandParametersTrailingInput
          :is-focused="focusedIndex === activeParameters.length"
          @create-parameter="createParameter"
          @update-parameter-value="updateParameterValue"
          @submit="submit"
          @navigate:previous="navigatePrevious(activeParameters.length)"
          @delete-last-parameter="deleteLastParameter"
          @collapse="collapseToText"
          @focus="focus(activeParameters.length)"
          @blur="blur(activeParameters.length)"
        />
        <MessageModelMessageInputSendMessageButton @click="submit" />
      </div>
    </StyledCard>
    <div px-1 pt-1 flex justify-between>
      <MessageModelMessageInputFooter />
    </div>
  </div>
</template>
