import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";

export const useSlashCommandStore = defineStore("message/input/slashCommand", () => {
  const pendingSlashCommand = ref<null | SlashCommand>(null);
  const parameterValues = ref<Record<string, string>>({});

  const setPendingSlashCommand = (slashCommand: SlashCommand) => {
    pendingSlashCommand.value = slashCommand;
    parameterValues.value = Object.fromEntries(slashCommand.parameters.map(({ name }) => [name, ""]));
  };

  const clearPendingSlashCommand = () => {
    pendingSlashCommand.value = null;
    parameterValues.value = {};
  };

  return { clearPendingSlashCommand, parameterValues, pendingSlashCommand, setPendingSlashCommand };
});
