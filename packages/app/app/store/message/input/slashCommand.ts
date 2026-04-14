import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";

import { toRawDeep } from "@esposter/shared";

export interface SlashCommandParameterError {
  id: string;
  messages: string[];
}

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

  const setPendingSlashCommand = (slashCommand: SlashCommand) => {
    pendingSlashCommand.value = structuredClone(toRawDeep(slashCommand));
    parameterValues.value = Object.fromEntries(pendingSlashCommand.value.parameters.map(({ name }) => [name, ""]));
    errors.value = [];
    trailingMessage.value = "";
  };

  const clearPendingSlashCommand = () => {
    pendingSlashCommand.value = null;
    parameterValues.value = {};
    errors.value = [];
    trailingMessage.value = "";
  };

  return {
    clearPendingSlashCommand,
    errors,
    parameterValues,
    pendingSlashCommand,
    setErrors,
    setPendingSlashCommand,
    trailingMessage,
  };
});
