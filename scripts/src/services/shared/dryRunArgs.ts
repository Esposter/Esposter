import type { BooleanArgDef } from "citty";

// Shared by every command that writes an account, so the switch reads the same wherever it is passed
export const dryRunArgs: Record<"dry-run", BooleanArgDef> = {
  "dry-run": { description: "Report what would be deleted or published without touching an account", type: "boolean" },
};
