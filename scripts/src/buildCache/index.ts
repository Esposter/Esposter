import { buildPackageCached } from "#src/services/buildCache/buildPackageCached";
import { defineCommand, runMain } from "citty";

// `bash .agents/skills/throughput/scripts/build-cached.sh <package directory>` — brings the package's workspace
// Dependencies up to date, then restores its `dist` from the cache when its inputs are unchanged, and otherwise builds
// It and stores it (the build skill's cache rule)
await runMain(
  defineCommand({
    args: {
      directory: { description: "The package directory to build, absolute", required: true, type: "positional" },
    },
    meta: { description: "Restore a package's dist from the build cache, or build and store it", name: "build-cached" },
    run: ({ args }) => {
      buildPackageCached(args.directory);
    },
  }),
);
