<script setup lang="ts">
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";
import type { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";

import { REQUIRED_ERROR_MESSAGE } from "@/services/message/slashCommands/constants";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { useInputStore } from "@/store/message/input";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const slashCommandStore = useSlashCommandStore();
const { activeParameterNames, focusedIndex, lastAddedParameterName, parameterValues, pendingSlashCommand } =
  storeToRefs(slashCommandStore);
const { buildText, clearPendingSlashCommand, createParameter, setErrors, setPendingSlashCommand } = slashCommandStore;
const inputStore = useInputStore();
const { input } = storeToRefs(inputStore);
const executeSlashCommand = useExecuteSlashCommand();
const commandTitle = ref(pendingSlashCommand.value?.type ?? "");

watchImmediate(pendingSlashCommand, (newPendingSlashCommand) => {
  if (newPendingSlashCommand) commandTitle.value = newPendingSlashCommand.type;
});

const activeParameters = computed(
  () => pendingSlashCommand.value?.parameters.filter(({ name }) => activeParameterNames.value.includes(name)) ?? [],
);
const hiddenParameters = computed(
  () => pendingSlashCommand.value?.parameters.filter(({ name }) => !activeParameterNames.value.includes(name)) ?? [],
);

const collapseToText = () => {
  input.value = buildText();
  clearPendingSlashCommand();
};

const deleteParameter = (index: number) => {
  const name = activeParameters.value[index]?.name;
  if (!name) return;

  activeParameterNames.value = activeParameterNames.value.filter((paramName) => paramName !== name);
  parameterValues.value[name] = "";
  setErrors(name, []);
  focus(index - 1);
};
const commandNavigateNext = () => {
  const newSlashCommand = Object.values(SlashCommandDefinitionMap).find(
    ({ type }) => type.toLowerCase() === commandTitle.value.toLowerCase(),
  );
  if (newSlashCommand && newSlashCommand.type !== pendingSlashCommand.value?.type) selectCommand(newSlashCommand);
  else if (activeParameters.value.length > 0) focus(0);
};
const selectCommand = (slashCommand: SlashCommand) => {
  setPendingSlashCommand(slashCommand);
  if (slashCommand.parameters.length === 0) submit();
  else focus(0);
};
const navigatePrevious = (index: number) => {
  focusedIndex.value = index - 1;
};
const navigateNext = (index: number) => {
  focusedIndex.value = index + 1;
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
const submit = async () => {
  if (!pendingSlashCommand.value || !currentRoomId.value) return;

  const missingRequiredParameters = pendingSlashCommand.value.parameters.filter(
    ({ isRequired, name }) => isRequired && !parameterValues.value[name]?.trim(),
  );

  for (const { isRequired, name } of pendingSlashCommand.value.parameters)
    if (isRequired) setErrors(name, parameterValues.value[name]?.trim() ? [] : [REQUIRED_ERROR_MESSAGE]);

  if (missingRequiredParameters.length > 0) {
    const hiddenMissingParameters = missingRequiredParameters.filter(
      ({ name }) => !activeParameterNames.value.includes(name),
    );
    if (hiddenMissingParameters.length > 0)
      activeParameterNames.value = [...activeParameterNames.value, ...hiddenMissingParameters.map(({ name }) => name)];
    return;
  }

  const payload = {
    parameterValues: parameterValues.value,
    type: pendingSlashCommand.value.type,
  } as {
    [P in SlashCommandType]: { parameterValues: SlashCommandParameters<P>; type: P };
  }[SlashCommandType];
  clearPendingSlashCommand();
  await executeSlashCommand(payload);
};

useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape" || (event.key === "Backspace" && focusedIndex.value === -1)) collapseToText();
});
</script>

<template>
  <div v-if="pendingSlashCommand" w-full>
    <StyledCard>
      <div flex items-center gap-2 px-4 pt-3 pb-2>
        <MessageModelMessageInputSlashCommandParametersCommandInput
          v-model="commandTitle"
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
            :autofocus="lastAddedParameterName === name || (lastAddedParameterName === null && index === 0)"
            :is-focused="focusedIndex === index"
            :model-value="parameterValues[name] ?? ''"
            @update:model-value="updateParameterValue(name, $event)"
            @delete="deleteParameter(index)"
            @submit="submit"
            @navigate:previous="navigatePrevious(index)"
            @navigate:next="navigateNext(index)"
            @focus="focus(index)"
            @blur="blur(index)"
          />
        </template>
        <MessageModelMessageInputSlashCommandParametersTrailingInput
          :hidden-parameters
          :active-parameters-length="activeParameters.length"
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
    <div flex justify-between px-1 pt-1>
      <MessageModelMessageInputFooter />
    </div>
  </div>
</template>
