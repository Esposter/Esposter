import type { InitArgs } from "@/models/cli/InitArgs";
import type { ArgsDef, CommandDef } from "citty";

import { Color } from "@/models/cli/Color";
import { BackendType } from "@/models/virrun/BackendType";
import { CommandType } from "@/models/virrun/CommandType";
import { Environment } from "@/models/virrun/Environment";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
import { buildVirrunConfigurationContent } from "@/services/configuration/buildVirrunConfigurationContent";
import { VIRRUN_CONFIGURATION_FILENAME } from "@/services/exec/util/constants";
import { defineCommand } from "citty";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// InitArgs keeps `options` a mutable `BackendType[]` (citty's EnumArgDef rejects a readonly array) and pins
// `type: "enum"` so citty infers `args.backend` as BackendType, not a widened string.
const initArgs: InitArgs = {
  backend: {
    default: BackendType.Auto,
    description: "Backend a sandboxed command runs through.",
    options: [BackendType.Auto, BackendType.Native, BackendType.Os, BackendType.Vfs],
    type: "enum",
  },
  environment: {
    default: Environment.None,
    description: "Framework whose generated artifacts the sandbox regenerates (e.g. nuxt → .nuxt).",
    options: [Environment.None, Environment.Nuxt],
    type: "enum",
  },
  force: { default: false, description: "Overwrite an existing virrun.config.json.", type: "boolean" },
} satisfies ArgsDef;
// Refuses to clobber an existing config unless `--force`, so a re-run never silently rewrites a committed choice.
export const initCommand: CommandDef<InitArgs> = defineCommand({
  args: initArgs,
  meta: {
    description: "Write a virrun.config.json selecting which backend sandboxed commands use.",
    name: CommandType.Init,
  },
  run: ({ args }) => {
    const path = join(process.cwd(), VIRRUN_CONFIGURATION_FILENAME);
    if (existsSync(path) && !args.force) {
      process.stderr.write(
        `${formatVirrunLine(`${colorize(VIRRUN_CONFIGURATION_FILENAME, Color.Blue)} already exists (use ${colorize("--force", Color.Yellow)} to overwrite)`)}\n`,
      );
      process.exitCode = 1;
      return;
    }
    writeFileSync(path, buildVirrunConfigurationContent(args.backend, args.environment));
    process.stderr.write(
      `${formatVirrunLine(`wrote ${colorize(path, Color.Blue)} (backend=${colorize(args.backend, Color.Blue)}, environment=${colorize(args.environment, Color.Blue)})`)}\n`,
    );
  },
});
