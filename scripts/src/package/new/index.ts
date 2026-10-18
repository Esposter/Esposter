import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { createPackage } from "#src/services/package/new/createPackage";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:package:new <name>` — writes a workspace package that passes the workspace suite on its first commit
await runCommand(
  defineCommand({
    args: {
      description: {
        default: "",
        description: "What the package does, as its README opens with; defaults to a placeholder naming it",
        type: "string",
      },
      kind: {
        default: PackageKind.Library,
        description:
          "library is built and published; nuxt-module is built for Nuxt; plugin is a private Claude Code plugin",
        options: Object.values(PackageKind),
        type: "enum",
      },
      name: {
        description: "The package's directory under packages/, lowercase words joined by hyphens",
        required: true,
        type: "positional",
      },
      register: {
        default: false,
        description: "Register a nuxt-module in the app's module list by its source path",
        type: "boolean",
      },
    },
    meta: {
      description: "Create a workspace package and the inventory and ledger entries that list it",
      name: "ai:package:new",
    },
    run: ({ args }) => {
      const options: CreatePackageOptions = {
        description: args.description || `${args.name} is a workspace package.`,
        kind: args.kind,
        name: args.name,
        register: args.register,
      };
      for (const path of createPackage(options)) console.info(path);
      console.info("next: run `pnpm i` to link the package, then write its purpose");
    },
  }),
);
