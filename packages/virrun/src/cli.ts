import { mainCommand } from "#src/services/cli/commands/mainCommand";
import { runMain } from "citty";
// The human-facing entrypoint (apps/web/content/docs/virrun/adoption.md). citty parses argv, renders `--help`, and
// Dispatches to the subcommands; `virrun -- <cmd>` is routed through mainCommand's default `run` subcommand. See
// MainCommand for the command tree.
await runMain(mainCommand);
