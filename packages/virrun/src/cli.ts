import { mainCommand } from "@/services/cli/commands/mainCommand";
import { runMain } from "citty";
// The human-facing entrypoint (specs/adoption.md). citty parses argv, renders `--help`, and dispatches to the
// Subcommands; `virrun -- <cmd>` is routed through mainCommand's default `run` subcommand. See mainCommand for the command tree.
await runMain(mainCommand);
