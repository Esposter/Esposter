import { splitArguments } from "./splitArguments";

// A clean deletes every untracked file, a peer's new ones included; a dry run lists them and is allowed
export const getCleanRefusal = (args: string[]): string | undefined => {
  const { flags } = splitArguments(args);
  const isDryRun = flags.some((flag) => flag === "--dry-run" || (!flag.startsWith("--") && flag.includes("n")));
  return isDryRun ? undefined : "git clean";
};
