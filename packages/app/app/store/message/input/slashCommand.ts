import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SlashCommandParameter } from "@/models/message/slashCommands/SlashCommandParameter";
import type { SlashCommandParameterError } from "@/models/message/slashCommands/SlashCommandParameterError";

import { ID_SEPARATOR, takeOne, toRawDeep } from "@esposter/shared";

export const useSlashCommandStore = defineStore("message/input/slashCommand", () => {
  const pendingSlashCommand = ref<null | SlashCommand>(null);
  const parameterValues = ref<Record<string, string>>({});
  const errors = ref<SlashCommandParameterError[]>([]);
  const trailingMessage = ref("");

  const setErrors = (id: string, messages: string[]) => {
    const index = errors.value.findIndex((e) => e.id === id);
    if (index === -1) errors.value = [...errors.value, { id, messages }];
    else errors.value = errors.value.map((e) => (e.id === id ? { ...e, messages } : e));
  };

  const parseTextAndParameters = (
    text: string,
    parameters: SlashCommandParameter[],
  ): { parameterValues: Record<string, string>; trailingMessage: string } => {
    const result: Record<string, string> = {};
    let remainingText = text.trim();

    for (const { name } of parameters) {
      const prefix = `${name}${ID_SEPARATOR}`;
      if (!remainingText.startsWith(prefix)) continue;
      remainingText = remainingText.slice(prefix.length);

      let nextParameterStartIndex = -1;
      for (const { name: nextName } of parameters) {
        if (nextName === name) continue;
        const index = remainingText.indexOf(` ${nextName}${ID_SEPARATOR}`);
        if (index !== -1 && (nextParameterStartIndex === -1 || index < nextParameterStartIndex))
          nextParameterStartIndex = index;
      }

      if (nextParameterStartIndex === -1) {
        result[name] = remainingText;
        remainingText = "";
        break;
      } else {
        result[name] = remainingText.slice(0, nextParameterStartIndex);
        remainingText = remainingText.slice(nextParameterStartIndex + 1);
      }
    }

    return { parameterValues: result, trailingMessage: remainingText };
  };

  const setPendingSlashCommand = (slashCommand: SlashCommand, remainingText = "") => {
    pendingSlashCommand.value = structuredClone(toRawDeep(slashCommand));
    const parameters = pendingSlashCommand.value.parameters;

    if (remainingText && parameters.length > 0) {
      const parsedTextAndParameters = parseTextAndParameters(remainingText, parameters);
      parameterValues.value = Object.fromEntries(
        parameters
          .filter(({ name }) => !Object.hasOwn(parsedTextAndParameters.parameterValues, name))
          .map(({ name }) => [name, takeOne(parsedTextAndParameters.parameterValues, name)]),
      );
      trailingMessage.value = parsedTextAndParameters.trailingMessage;
    } else {
      parameterValues.value = Object.fromEntries(parameters.map(({ name }) => [name, ""]));
      trailingMessage.value = "";
    }

    errors.value = [];
  };

  const buildText = (): string => {
    if (!pendingSlashCommand.value) return "";
    const parts = [`/${pendingSlashCommand.value.type}`];

    for (const { name } of pendingSlashCommand.value.parameters) {
      const value = parameterValues.value[name];
      if (value) parts.push(`${name}${ID_SEPARATOR}${value}`);
    }

    const trimmedTrailingMessage = trailingMessage.value.trim();
    if (trimmedTrailingMessage) parts.push(trimmedTrailingMessage);
    return parts.join(" ");
  };

  const clearPendingSlashCommand = () => {
    pendingSlashCommand.value = null;
    parameterValues.value = {};
    errors.value = [];
    trailingMessage.value = "";
  };

  return {
    buildText,
    clearPendingSlashCommand,
    errors,
    parameterValues,
    pendingSlashCommand,
    setErrors,
    setPendingSlashCommand,
    trailingMessage,
  };
});
