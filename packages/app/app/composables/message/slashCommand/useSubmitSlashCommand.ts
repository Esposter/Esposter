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

    const missingRequiredParameters = pendingSlashCommand.value.parameters.filter(
      ({ isRequired, name }) =>
        isRequired && !slashCommandParameterValueSchema.safeParse(parameterValues.value[name]).success,
    );

    for (const { isRequired, name } of pendingSlashCommand.value.parameters)
      if (isRequired)
        setErrors(
          name,
          slashCommandParameterValueSchema.safeParse(parameterValues.value[name]).success
            ? []
            : [REQUIRED_ERROR_MESSAGE],
        );

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

    const payload = {
      parameterValues: parameterValues.value,
      type: pendingSlashCommand.value.type,
    } as {
      [P in SlashCommandType]: { parameterValues: SlashCommandParameters<P>; type: P };
    }[SlashCommandType];
    clearPendingSlashCommand();
    await executeSlashCommand(payload);
  };
};
