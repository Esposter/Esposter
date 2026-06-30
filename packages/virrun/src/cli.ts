import { mainCommand } from "@/services/cli/commands/mainCommand";
import { runMain } from "citty";
// The human-facing entrypoint (specs/adoption.md). citty parses argv, renders `--help`, and dispatches to the
// Subcommands; the root command's own run is the `virrun -- <cmd>` passthrough. See mainCommand for the command tree.
await runMain(mainCommand);
