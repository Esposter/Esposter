import type { UiCommand } from "@/models/ui/UiCommand";

// Does what a command does: runs it, or goes where it leads. A disabled command does nothing, so a shortcut bound to it
// Cannot run an action the selection has refused
export const runCommand = async ({ isDisabled, run, to }: UiCommand) => {
  if (isDisabled) return;
  if (run) await run();
  else if (to) await navigateTo(to);
};
