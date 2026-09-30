import type { SubCommandsDef } from "citty";

import { BackendType } from "#src/models/virrun/BackendType";
import { CommandType } from "#src/models/virrun/CommandType";
import { Environment } from "#src/models/virrun/Environment";
import { writeInitConfiguration } from "#src/services/cli/init/writeInitConfiguration";
import { defineCommand } from "citty";

export const initCommand: SubCommandsDef[string] = defineCommand({
  args: {
    backend: {
      default: BackendType.Os,
      description: "Backend a sandboxed command runs through.",
      options: Object.values(BackendType),
      type: "enum",
    },
    // No `default`: an omitted `--environment` stays undefined (no preset), the same "absence is none" the config uses.
    environment: {
      description: "Framework whose generated artifacts the sandbox regenerates (e.g. nuxt → .nuxt); omit for none.",
      options: Object.values(Environment),
      required: false,
      type: "enum",
    },
    force: { default: false, description: "Overwrite an existing virrun.config.json.", type: "boolean" },
  },
  meta: {
    description: "Write a virrun.config.json selecting which backend sandboxed commands use.",
    name: CommandType.Init,
  },
  run: ({ args }) => {
    writeInitConfiguration(args.backend, args.environment, args.force);
  },
});
