<script setup lang="ts">
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";
import type { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";

import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { useInputStore } from "@/store/message/input";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const slashCommandStore = useSlashCommandStore();
const { parameterValues, pendingSlashCommand } = storeToRefs(slashCommandStore);
const { buildText, clearPendingSlashCommand, setErrors, setPendingSlashCommand } = slashCommandStore;
const inputStore = useInputStore();
const { input } = storeToRefs(inputStore);
const executeSlashCommand = useExecuteSlashCommand();
const { execute, isLoading } = useInFlight();
const activeParameterNames = ref<string[]>([]);
const commandTitle = ref(pendingSlashCommand.value?.type ?? "");
const lastAddedParameterName = ref<null | string>(null);
const focusedIndex = ref(0);
const suggestedItems = computed(() => {
  const query = commandTitle.value.toLowerCase();
  return Object.values(SlashCommandDefinitionMap).filter(
    ({ description, title }) => title.toLowerCase().includes(query) || description.toLowerCase().includes(query),
  );
});

watchImmediate(pendingSlashCommand, (newPendingSlashCommand) => {
  if (newPendingSlashCommand) commandTitle.value = newPendingSlashCommand.type;
  activeParameterNames.value = newPendingSlashCommand?.parameters.map(({ name }) => name) ?? [];
  lastAddedParameterName.value = null;
});

const activeParameters = computed(
  () => pendingSlashCommand.value?.parameters.filter(({ name }) => activeParameterNames.value.includes(name)) ?? [],
);
const hiddenParameters = computed(
  () => pendingSlashCommand.value?.parameters.filter(({ name }) => !activeParameterNames.value.includes(name)) ?? [],
);
const requiredHiddenParameters = computed(() => hiddenParameters.value.filter(({ isRequired }) => isRequired));
const optionalHiddenParameters = computed(() => hiddenParameters.value.filter(({ isRequired }) => !isRequired));

const collapseToText = () => {
  input.value = buildText();
  clearPendingSlashCommand();
};

const createParameter = (name: string) => {
  lastAddedParameterName.value = name;
  activeParameterNames.value = [...activeParameterNames.value, name];
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
const submit = () =>
  execute(async () => {
    if (!pendingSlashCommand.value || !currentRoomId.value) return;

    const missingRequiredParameters = pendingSlashCommand.value.parameters.filter(
      ({ isRequired, name }) => isRequired && !parameterValues.value[name]?.trim(),
    );

    for (const { isRequired, name } of pendingSlashCommand.value.parameters)
      if (isRequired) setErrors(name, parameterValues.value[name]?.trim() ? [] : [`${name} is required`]);

    if (missingRequiredParameters.length > 0) {
      const hiddenMissingParameters = missingRequiredParameters.filter(
        ({ name }) => !activeParameterNames.value.includes(name),
      );
      if (hiddenMissingParameters.length > 0)
        activeParameterNames.value = [
          ...activeParameterNames.value,
          ...hiddenMissingParameters.map(({ name }) => name),
        ];
      return;
    }

    await executeSlashCommand({ parameterValues: parameterValues.value, type: pendingSlashCommand.value.type } as {
      [P in SlashCommandType]: { parameterValues: SlashCommandParameters<P>; type: P };
    }[SlashCommandType]);
    clearPendingSlashCommand();
  });

useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape" || (event.key === "Backspace" && focusedIndex.value === -1)) collapseToText();
});
</script>

<template>
  <div v-if="pendingSlashCommand" w-full>
    <StyledCard>
      <div flex items-center gap-2 px-4 pt-3 pb-2>
        <MessageModelMessageInputSlashCommandParametersCommandInputMenu
          v-model="commandTitle"
          :items="suggestedItems"
          :is-focused="focusedIndex === -1"
          @navigate:next="commandNavigateNext"
          @delete="collapseToText"
          @select:command="selectCommand"
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
        <MessageModelMessageInputSlashCommandParametersTrailingInputMenu
          :hidden-parameters
          :required-hidden-parameters
          :optional-hidden-parameters
          :options-label="`+${hiddenParameters.length} ${hiddenParameters.length === 1 ? 'option' : 'options'}`"
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
        <MessageModelMessageInputSendMessageButton :is-loading @click="submit" />
      </div>
    </StyledCard>
    <div flex justify-between px-1 pt-1>
      <MessageModelMessageInputFooter />
    </div>
  </div>
</template>
