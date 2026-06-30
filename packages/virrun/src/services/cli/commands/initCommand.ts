import type { ArgsDef, CommandDef } from "citty";

import { BackendType } from "@/models/virrun/BackendType";
import { buildVirrunConfigurationContent } from "@/services/configuration/buildVirrunConfigurationContent";
import { VIRRUN_CONFIGURATION_FILENAME } from "@/services/exec/util/constants";
import { defineCommand } from "citty";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
// Explicit annotation + `satisfies ArgsDef`: the annotation is what isolatedDeclarations emits (an exported
// `CommandDef<typeof initArgs>` needs the const's type declared, not inferred — and a specific-args CommandDef is
// Not assignable to the generic CommandDef), while `satisfies ArgsDef` validates the literal against citty's own
// Arg-definition shape. The annotation keeps `options` a mutable `BackendType[]` (citty's EnumArgDef wants a mutable
// Array, so a whole-object `as const` — which would make it readonly — is out) and pins the literal `type: "enum"`,
// Together letting citty infer `args.backend` as BackendType rather than a widened string.
const initArgs: {
  backend: { default: BackendType; description: string; options: BackendType[]; type: "enum" };
  force: { default: boolean; description: string; type: "boolean" };
} = {
  backend: {
    default: BackendType.Auto,
    description: "Backend a sandboxed command runs through.",
    options: [BackendType.Auto, BackendType.Native, BackendType.Os, BackendType.Vfs],
    type: "enum",
  },
  force: { default: false, description: "Overwrite an existing virrun.config.json.", type: "boolean" },
} satisfies ArgsDef;
// `virrun init [--backend] [--force]` — writes a `virrun.config.json` in the cwd selecting which backend sandboxed
// Commands run through. Refuses to clobber an existing config unless `--force`, so a re-run never silently rewrites
// A committed choice. The `$schema`-pointed content comes from buildVirrunConfigurationContent.
export const initCommand: CommandDef<typeof initArgs> = defineCommand({
  args: initArgs,
  meta: {
    description: "Write a virrun.config.json selecting which backend sandboxed commands use.",
    name: "init",
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
