/* oxlint-disable typescript/no-misused-promises, typescript/strict-void-return -- the key listener and the hotkey composable both ignore what their callbacks return */
import type { UiCommand } from "#src/models/ui/UiCommand";

import { getAltLetterChordMatcher } from "#src/services/ui/getAltLetterChordMatcher";
import { runCommand } from "#src/services/ui/runCommand";
import { useCommandStore } from "#src/store/ui/command";
import { checkIsEditableTarget } from "#src/util/dom/checkIsEditableTarget";
import { useHotkey } from "@vuetify/v0";

// Registers a surface's commands for as long as the calling component is mounted, and binds each shortcut through
// The hotkey composable for as long as its command is registered, so the shortcuts dialog never lists a key that
// Does nothing. A shortcut never fires while a field has focus, where its keys are typing. An Alt chord on a letter is
// Bound by its key instead, since Alt changes the character the hotkey composable compares
export const useCommands = (commands: MaybeRefOrGetter<readonly UiCommand[]>) => {
  const commandStore = useCommandStore();
  const { registerCommands } = commandStore;

  onScopeDispose(registerCommands(() => toValue(commands)));

  watchImmediate(
    () => toValue(commands).filter(({ run, shortcut, to }) => shortcut && (run || to)),
    (newBoundCommands, _oldBoundCommands, onCleanup) => {
      const bindingsScope = effectScope();
      bindingsScope.run(() => {
        for (const command of newBoundCommands) {
          const matchesAltLetterChord = getAltLetterChordMatcher(command.shortcut ?? "");
          if (matchesAltLetterChord)
            useEventListener(window, "keydown", async (event) => {
              if (!matchesAltLetterChord(event) || checkIsEditableTarget(event.target)) return;

              event.preventDefault();
              await runCommand(command);
            });
          else
            useHotkey(command.shortcut, async () => {
              await runCommand(command);
            });
        }
      });
      onCleanup(() => {
        bindingsScope.stop();
      });
    },
  );
};
