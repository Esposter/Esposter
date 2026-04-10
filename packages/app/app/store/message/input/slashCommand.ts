import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";

export const useSlashCommandStore = defineStore("message/input/slashCommand", () => {
  const pendingSlashCommand = ref<SlashCommand | null>(null);
  const paramValues = ref<Record<string, string>>({});

  const setPendingSlashCommand = (slashCommand: SlashCommand) => {
    pendingSlashCommand.value = slashCommand;
    paramValues.value = Object.fromEntries(slashCommand.parameters.map(({ name }) => [name, ""]));
  };

  const clearPendingSlashCommand = () => {
    pendingSlashCommand.value = null;
    paramValues.value = {};
  };

  return { clearPendingSlashCommand, paramValues, pendingSlashCommand, setPendingSlashCommand };
});
