<script setup lang="ts">
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";

import SlashCommandParametersChip from "@/components/Message/Model/Message/Input/SlashCommandParameters/Chip.vue";
import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { useDataStore } from "@/store/message/data";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";
import { marked } from "marked";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const slashCommandStore = useSlashCommandStore();
const { parameterValues, pendingSlashCommand } = storeToRefs(slashCommandStore);
const { clearPendingSlashCommand, setErrors, setPendingSlashCommand } = slashCommandStore;
const dataStore = useDataStore();
const { createMessage } = dataStore;
const { execute, isLoading } = useInFlight();
const activeParameterNames = ref<string[]>([]);
const commandInputMenuRef = useTemplateRef("commandInputMenu");
const commandTitle = ref(pendingSlashCommand.value?.type ?? "");
const trailingInputMenuRef = useTemplateRef("trailingInputMenu");
const lastAddedParameterName = ref<null | string>(null);
const parameterInputRefs = ref<InstanceType<typeof SlashCommandParametersChip>[]>([]);

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

const addParameter = (name: string) => {
  lastAddedParameterName.value = name;
  activeParameterNames.value = [...activeParameterNames.value, name];
};
const removeParameter = (index: number) => {
  const name = activeParameters.value[index]?.name;
  if (!name) return;

  activeParameterNames.value = activeParameterNames.value.filter((paramName) => paramName !== name);
  parameterValues.value[name] = "";
  setErrors(name, []);
  if (index === 0) commandInputMenuRef.value?.focus();
  else parameterInputRefs.value[index - 1]?.focus();
};
const commandNavigateNext = async () => {
  const newSlashCommand = Object.values(SlashCommandDefinitionMap).find(
    ({ type }) => type.toLowerCase() === commandTitle.value.toLowerCase(),
  );
  if (newSlashCommand && newSlashCommand.type !== pendingSlashCommand.value?.type) {
    selectCommand(newSlashCommand);
    return;
  }

  if (activeParameters.value.length > 0) parameterInputRefs.value[0]?.focus();
  else trailingInputMenuRef.value?.focus();
};
const selectCommand = async (slashCommand: SlashCommand) => {
  setPendingSlashCommand(slashCommand);
  if (activeParameters.value.length > 0) parameterInputRefs.value[0]?.focus();
  else trailingInputMenuRef.value?.focus();
};
const navigatePrevious = (index: number) => {
  if (index > 0) parameterInputRefs.value[index - 1]?.focus();
  else commandInputMenuRef.value?.focus();
};
const navigateNext = (index: number) => {
  if (index < activeParameters.value.length - 1) parameterInputRefs.value[index + 1]?.focus();
  else trailingInputMenuRef.value?.focus();
};
const updateParameterValue = (name: string, value: string) => {
  parameterValues.value[name] = value;
};
const removeLastParameter = () => {
  const lastIndex = activeParameters.value.length - 1;
  if (lastIndex >= 0) removeParameter(lastIndex);
};
const submit = () =>
  execute(async () => {
    if (!pendingSlashCommand.value || !currentRoomId.value) return;

    const missingRequiredParameters = pendingSlashCommand.value.parameters.filter(
      ({ isRequired, name }) => isRequired && !parameterValues.value[name]?.trim(),
    );

    for (const { isRequired, name } of pendingSlashCommand.value.parameters) {
      if (isRequired) setErrors(name, parameterValues.value[name]?.trim() ? [] : [`${name} is required`]);
    }

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

    const command = {
      parameterValues: parameterValues.value,
      type: pendingSlashCommand.value.type,
    } as {
      [K in SlashCommandType]: { parameterValues: SlashCommandParameters<K>; type: K };
    }[SlashCommandType];
    const roomId = currentRoomId.value;

    switch (command.type) {
      case SlashCommandType.Me:
        await createMessage({
          message: marked.parse(`*${sanitizeHtml(command.parameterValues.message)}*`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      case SlashCommandType.Shrug: {
        const prefix = command.parameterValues.text?.trim() ?? "";
        await createMessage({
          message: marked.parse(`${prefix}¯\\\\\\_(ツ)\\_/¯`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      }
    }

    clearPendingSlashCommand();
  });

useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") clearPendingSlashCommand();
});
</script>

<template>
  <div v-if="pendingSlashCommand" w-full>
    <StyledCard>
      <div flex items-center gap-2 px-4 pt-3 pb-2>
        <MessageModelMessageInputSlashCommandParametersCommandInputMenu
          ref="commandInputMenu"
          v-model="commandTitle"
          :items="suggestedItems"
          @navigate:next="commandNavigateNext"
          @remove="clearPendingSlashCommand"
          @select:command="selectCommand"
        />
        <template v-for="({ isRequired, name }, index) of activeParameters" :key="name">
          <MessageModelMessageInputSlashCommandParametersChip
            :ref="
              (el) => {
                if (el) parameterInputRefs[index] = el as InstanceType<typeof SlashCommandParametersChip>;
              }
            "
            :is-required
            :name
            :autofocus="lastAddedParameterName === name || (lastAddedParameterName === null && index === 0)"
            :model-value="parameterValues[name] ?? ''"
            @update:model-value="updateParameterValue(name, $event)"
            @remove="removeParameter(index)"
            @submit="submit"
            @navigate:previous="navigatePrevious(index)"
            @navigate:next="navigateNext(index)"
          />
        </template>
        <MessageModelMessageInputSlashCommandParametersTrailingInputMenu
          ref="trailingInputMenu"
          :hidden-parameters
          :required-hidden-parameters
          :optional-hidden-parameters
          :options-label="`+${hiddenParameters.length} ${hiddenParameters.length === 1 ? 'option' : 'options'}`"
          :active-parameters-length="activeParameters.length"
          @add-parameter="addParameter"
          @update-parameter-value="updateParameterValue"
          @submit="submit"
          @navigate:previous="navigatePrevious(activeParameters.length)"
          @remove-last-parameter="removeLastParameter"
        />
        <MessageModelMessageInputSendMessageButton :is-loading @click="submit" />
      </div>
    </StyledCard>
    <div flex justify-between px-1 pt-1>
      <MessageModelMessageInputFooter />
    </div>
  </div>
</template>
