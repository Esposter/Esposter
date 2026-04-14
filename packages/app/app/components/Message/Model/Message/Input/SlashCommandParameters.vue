<script setup lang="ts">
import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { useDataStore } from "@/store/message/data";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";
import { marked } from "marked";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const slashCommandStore = useSlashCommandStore();
const { isSubmitAttempted, parameterValues, pendingSlashCommand, trailingMessage } = storeToRefs(slashCommandStore);
const { clearPendingSlashCommand } = slashCommandStore;
const dataStore = useDataStore();
const { createMessage } = dataStore;
const { execute, isLoading } = useInFlight();
const activeParameterNames = ref<string[]>([]);
const selectedHiddenIndex = ref(0);
const lastAddedParameterName = ref<null | string>(null);

watchImmediate(pendingSlashCommand, (newPendingSlashCommand) => {
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

watch(hiddenParameters, () => {
  selectedHiddenIndex.value = 0;
});

const optionsLabel = computed(() => {
  const count = hiddenParameters.value.length;
  return `+${count} ${count === 1 ? "option" : "options"}`;
});

const addParameter = (name: string) => {
  lastAddedParameterName.value = name;
  activeParameterNames.value = [...activeParameterNames.value, name];
};

const removeParameter = (name: string) => {
  activeParameterNames.value = activeParameterNames.value.filter((paramName) => paramName !== name);
  parameterValues.value[name] = "";
};

const updateParameterValue = (name: string, value: string) => {
  parameterValues.value[name] = value;
};

const handleTrailingKeydown = (event: KeyboardEvent) => {
  if (hiddenParameters.value.length > 0) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedHiddenIndex.value = Math.max(0, selectedHiddenIndex.value - 1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedHiddenIndex.value = Math.min(hiddenParameters.value.length - 1, selectedHiddenIndex.value + 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const parameter = hiddenParameters.value[selectedHiddenIndex.value] ?? hiddenParameters.value[0];
      if (parameter) addParameter(parameter.name);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const parameter = hiddenParameters.value[selectedHiddenIndex.value] ?? hiddenParameters.value[0];
      if (!parameter) return;
      addParameter(parameter.name);
      updateParameterValue(parameter.name, event.key);
      return;
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    submit();
  }

  if (event.key === "Backspace" && !trailingMessage.value && activeParameters.value.length > 0) {
    event.preventDefault();
    const lastParameter = activeParameters.value.at(-1);
    if (lastParameter) removeParameter(lastParameter.name);
  }
};

const submit = () =>
  execute(async () => {
    if (!pendingSlashCommand.value || !currentRoomId.value) return;

    const missingRequiredParameterNames = pendingSlashCommand.value.parameters
      .filter(({ isRequired, name }) => isRequired && !parameterValues.value[name]?.trim())
      .map(({ name }) => name);

    if (missingRequiredParameterNames.length > 0) {
      const hiddenRequiredParameterNames = missingRequiredParameterNames.filter(
        (name) => !activeParameterNames.value.includes(name),
      );
      if (hiddenRequiredParameterNames.length > 0)
        activeParameterNames.value = [...activeParameterNames.value, ...hiddenRequiredParameterNames];
      isSubmitAttempted.value = true;
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
      <div flex items-center gap-2 px-4 pt-3 pb-2 flex-wrap>
        <template v-for="({ isRequired, name }, index) of activeParameters" :key="name">
          <MessageModelMessageInputSlashCommandParameterChip
            :is-required
            :is-submit-attempted
            :name
            :autofocus="lastAddedParameterName === name || (lastAddedParameterName === null && index === 0)"
            :model-value="parameterValues[name] ?? ''"
            @update:model-value="(value) => updateParameterValue(name, value)"
            @remove="removeParameter(name)"
            @submit="submit"
          />
        </template>
        <v-menu
          :model-value="hiddenParameters.length > 0"
          location="top"
          :close-on-content-click="false"
          @update:model-value="() => {}"
        >
          <template #activator="{ props: menuProps }">
            <input
              v-model="trailingMessage"
              flex-1
              b-none
              outline-none
              text-sm
              cursor-text
              :readonly="hiddenParameters.length > 0"
              :placeholder="hiddenParameters.length > 0 ? optionsLabel : ''"
              :="menuProps"
              @keydown="handleTrailingKeydown"
            />
          </template>
          <v-list density="compact" min-w-48>
            <v-list-subheader v-if="requiredHiddenParameters.length > 0">REQUIRED OPTIONS</v-list-subheader>
            <v-list-item
              v-for="({ name }, i) of requiredHiddenParameters"
              :key="name"
              :active="i === selectedHiddenIndex"
              @click="addParameter(name)"
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
                @click="addParameter(name)"
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
        <v-spacer />
        <MessageModelMessageInputSendButton :is-loading @click="submit" />
      </div>
    </StyledCard>
    <div flex justify-between px-1 pt-1>
      <MessageModelMessageInputFooter />
    </div>
  </div>
</template>
