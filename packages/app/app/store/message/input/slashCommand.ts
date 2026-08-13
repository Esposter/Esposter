import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SlashCommandParameterError } from "@/models/message/slashCommands/SlashCommandParameterError";

import { parseTextAndParameters } from "@/services/message/slashCommands/parseTextAndParameters";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { ID_SEPARATOR, normalizeString, takeOne, toRawDeep } from "@esposter/shared";

export const useSlashCommandStore = defineStore("message/input/slashCommand", () => {
  const roomStore = useRoomStore();
  const inputStore = useInputStore();
  const { data: pendingSlashCommand } = useDataMap<SlashCommand | undefined>(() => roomStore.currentRoomId, undefined);
  const { data: parameterValues } = useDataMap<Record<string, string>>(() => roomStore.currentRoomId, {});
  const { data: activeParameterNames } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: errors } = useDataMap<SlashCommandParameterError[]>(() => roomStore.currentRoomId, []);
  const { data: trailingMessage } = useDataMap(() => roomStore.currentRoomId, "");
  const { data: focusedIndex } = useDataMap(() => roomStore.currentRoomId, 0);
  const { data: selectedHiddenIndex } = useDataMap(() => roomStore.currentRoomId, 0);
  const { data: lastAddedParameterName } = useDataMap(() => roomStore.currentRoomId, "");
  const activeParameters = computed(
    () => pendingSlashCommand.value?.parameters.filter(({ name }) => activeParameterNames.value.includes(name)) ?? [],
  );
  const hiddenParameters = computed(
    () => pendingSlashCommand.value?.parameters.filter(({ name }) => !activeParameterNames.value.includes(name)) ?? [],
  );

  watch(activeParameterNames, () => {
    selectedHiddenIndex.value = 0;
  });

  const setErrors = (id: string, messages: string[]) => {
    const index = errors.value.findIndex((error) => error.id === id);
    if (index === -1) errors.value = [...errors.value, { id, messages }];
    else errors.value = errors.value.map((error) => (error.id === id ? { ...error, messages } : error));
  };

  const createParameter = (name: string) => {
    lastAddedParameterName.value = name;
    activeParameterNames.value = [...activeParameterNames.value, name];
  };

  const deleteParameter = (name: string) => {
    activeParameterNames.value = activeParameterNames.value.filter((parameterName) => parameterName !== name);
    parameterValues.value[name] = "";
    setErrors(name, []);
  };

  const selectPreviousHiddenParameter = () => {
    selectedHiddenIndex.value = Math.max(0, selectedHiddenIndex.value - 1);
  };

  const selectNextHiddenParameter = () => {
    selectedHiddenIndex.value = Math.min(hiddenParameters.value.length - 1, selectedHiddenIndex.value + 1);
  };

  const setPendingSlashCommand = (slashCommand: SlashCommand, remainingText = "") => {
    pendingSlashCommand.value = structuredClone(toRawDeep(slashCommand));
    const parameters = pendingSlashCommand.value.parameters;

    if (remainingText && parameters.length > 0) {
      const parsedTextAndParameters = parseTextAndParameters(remainingText, parameters);
      parameterValues.value = Object.fromEntries(
        parameters
          .filter(({ name }) => Object.hasOwn(parsedTextAndParameters.parameterValues, name))
          .map(({ name }) => [name, takeOne(parsedTextAndParameters.parameterValues, name)]),
      );
      trailingMessage.value = parsedTextAndParameters.trailingMessage;
    } else {
      parameterValues.value = Object.fromEntries(parameters.map(({ name }) => [name, ""]));
      trailingMessage.value = "";
    }

    activeParameterNames.value = parameters.map(({ name }) => name);
    errors.value = [];
    focusedIndex.value = 0;
    lastAddedParameterName.value = "";
  };

  const buildText = (): string => {
    if (!pendingSlashCommand.value) return "";
    const parts = [`/${pendingSlashCommand.value.type}`];

    for (const { name } of pendingSlashCommand.value.parameters) {
      const value = parameterValues.value[name];
      if (value) parts.push(`${name}${ID_SEPARATOR}${value}`);
    }

    const normalizedTrailingMessage = normalizeString(trailingMessage.value);
    if (normalizedTrailingMessage) parts.push(normalizedTrailingMessage);
    return parts.join(" ");
  };

  const clearPendingSlashCommand = () => {
    pendingSlashCommand.value = undefined;
    parameterValues.value = {};
    activeParameterNames.value = [];
    errors.value = [];
    trailingMessage.value = "";
    focusedIndex.value = 0;
    lastAddedParameterName.value = "";
  };

  const collapseToText = () => {
    inputStore.input = buildText();
    clearPendingSlashCommand();
  };

  return {
    activeParameterNames,
    activeParameters,
    clearPendingSlashCommand,
    collapseToText,
    createParameter,
    deleteParameter,
    errors,
    focusedIndex,
    hiddenParameters,
    lastAddedParameterName,
    parameterValues,
    pendingSlashCommand,
    selectedHiddenIndex,
    selectNextHiddenParameter,
    selectPreviousHiddenParameter,
    setErrors,
    setPendingSlashCommand,
    trailingMessage,
  };
});
