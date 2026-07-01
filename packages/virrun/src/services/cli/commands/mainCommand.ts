import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { cacheCommand } from "@/services/cli/commands/cacheCommand";
import { doctorCommand } from "@/services/cli/commands/doctorCommand";
import { execCommand } from "@/services/cli/commands/execCommand";
import { initCommand } from "@/services/cli/commands/initCommand";
import { runCommand } from "@/services/cli/commands/runCommand";
import { snapshotCommand } from "@/services/cli/commands/snapshotCommand";
import { defineCommand } from "citty";
// `default: CommandType.Run` routes the bare `virrun -- <cmd>` prefix to `run` via citty's default-subcommand
// Mechanism rather than an own `run`, because citty 0.2.2 runs a parent's `run` *in addition to* a matched
// Subcommand — which would fire the passthrough after every `init`/`cache`/… call. A leading `--` is never matched
// As a subcommand, so the prefix form always falls to the default `run`.
export const mainCommand: CommandDef = defineCommand({
  default: CommandType.Run,
  meta: {
    description: "Run a repo's real toolchain fast and isolated. `virrun -- <cmd>` sandboxes any command.",
    name: "virrun",
  },
  subCommands: {
    [CommandType.Cache]: cacheCommand,
    [CommandType.Doctor]: doctorCommand,
    [CommandType.Exec]: execCommand,
    [CommandType.Init]: initCommand,
    [CommandType.Run]: runCommand,
    [CommandType.Snapshot]: snapshotCommand,
  },
});
