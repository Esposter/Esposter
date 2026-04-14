import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";

export const useSlashCommandStore = defineStore("message/input/slashCommand", () => {
  const pendingSlashCommand = ref<null | SlashCommand>(null);
  const parameterValues = ref<Record<string, string>>({});
  const isSubmitAttempted = ref(false);
  const trailingMessage = ref("");

  const setPendingSlashCommand = (slashCommand: SlashCommand) => {
    pendingSlashCommand.value = slashCommand;
    parameterValues.value = Object.fromEntries(slashCommand.parameters.map(({ name }) => [name, ""]));
    isSubmitAttempted.value = false;
    trailingMessage.value = "";
  };

  const clearPendingSlashCommand = () => {
    pendingSlashCommand.value = null;
    parameterValues.value = {};
    isSubmitAttempted.value = false;
    trailingMessage.value = "";
  };

  return {
    clearPendingSlashCommand,
    isSubmitAttempted,
    parameterValues,
    pendingSlashCommand,
    setPendingSlashCommand,
    trailingMessage,
  };
});
