import type { UiCommand } from "@/models/ui/UiCommand";

import { runCommand } from "@/services/ui/runCommand";
import { useCommandStore } from "@/store/ui/command";
import { useHotkey } from "@vuetify/v0";

// Registers a surface's commands for as long as the calling component is mounted, and binds each shortcut through
// The hotkey composable for as long as its command is registered, so the shortcuts dialog never lists a key that
// Does nothing. A shortcut never fires while a field has focus, where its keys are typing
export const useCommands = (commands: MaybeRefOrGetter<readonly UiCommand[]>) => {
  const commandStore = useCommandStore();
  const { registerCommands } = commandStore;

  onScopeDispose(registerCommands(() => toValue(commands)));

  watchImmediate(
    () => toValue(commands).filter(({ run, shortcut, to }) => shortcut && (run || to)),
    (newBoundCommands, _oldBoundCommands, onCleanup) => {
      const bindingsScope = effectScope();
      bindingsScope.run(() => {
        for (const command of newBoundCommands)
          // oxlint-disable-next-line typescript/no-misused-promises, typescript/strict-void-return -- the hotkey composable ignores what its callback returns
          useHotkey(command.shortcut, async () => {
            await runCommand(command);
          });
      });
      onCleanup(() => {
        bindingsScope.stop();
      });
    },
  );
};
