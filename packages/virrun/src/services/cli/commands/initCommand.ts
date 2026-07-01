import type { InitArgs } from "@/models/cli/InitArgs";
import type { ArgsDef, CommandDef } from "citty";

import { BackendType } from "@/models/virrun/BackendType";
import { CommandType } from "@/models/virrun/CommandType";
import { buildVirrunConfigurationContent } from "@/services/configuration/buildVirrunConfigurationContent";
import { VIRRUN_CONFIGURATION_FILENAME } from "@/services/exec/util/constants";
import { defineCommand } from "citty";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
// InitArgs keeps `options` a mutable `BackendType[]` (citty's EnumArgDef rejects a readonly array) and pins
// `type: "enum"` so citty infers `args.backend` as BackendType, not a widened string.
const initArgs: InitArgs = {
  backend: {
    default: BackendType.Auto,
    description: "Backend a sandboxed command runs through.",
    options: [BackendType.Auto, BackendType.Native, BackendType.Os, BackendType.Vfs],
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
      process.stderr.write(`[virrun] ${VIRRUN_CONFIGURATION_FILENAME} already exists (use --force to overwrite)\n`);
      process.exitCode = 1;
      return;
    }
    writeFileSync(path, buildVirrunConfigurationContent(args.backend));
    process.stderr.write(`[virrun] wrote ${path} (backend=${args.backend})\n`);
  },
});
