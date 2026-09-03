import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";
import type { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";

import { slashCommandParameterValueSchema } from "@/models/message/slashCommands/SlashCommandParameter";
import { REQUIRED_ERROR_MESSAGE } from "@/services/message/slashCommands/constants";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";

export const useSubmitSlashCommand = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const slashCommandStore = useSlashCommandStore();
  const { activeParameterNames, parameterValues, pendingSlashCommand } = storeToRefs(slashCommandStore);
  const { clearPendingSlashCommand, setErrors } = slashCommandStore;
  const executeSlashCommand = useExecuteSlashCommand();
  return async () => {
    if (!pendingSlashCommand.value || !currentRoomId.value) return;

    const missingRequiredParameters = pendingSlashCommand.value.parameters.filter(({ isRequired, name }) => {
      if (!isRequired) return false;

      const isMissing = !slashCommandParameterValueSchema.safeParse(parameterValues.value[name]).success;
      setErrors(name, isMissing ? [REQUIRED_ERROR_MESSAGE] : []);
      return isMissing;
    });

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
      [P in SlashCommandType]: { parameterValues: SlashCommandParameters<P>; type: P };
    }[SlashCommandType];
    clearPendingSlashCommand();
    await executeSlashCommand(command);
  };
};
