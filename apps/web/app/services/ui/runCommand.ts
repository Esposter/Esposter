import type { UiCommand } from "@/models/ui/UiCommand";

// Does what a command does: runs it, or goes where it leads
export const runCommand = async ({ run, to }: UiCommand) => {
  if (run) await run();
  else if (to) await navigateTo(to);
};
