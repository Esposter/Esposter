import { buildPackageCached } from "#src/services/buildCache/buildPackageCached";
import { defineCommand, runMain } from "citty";

// `bash .agents/skills/throughput/scripts/build-cached.sh <package directory>` — restores a workspace package's `dist`
// From the cache when its inputs are unchanged, and otherwise builds it and stores it (the throughput skill's
// `references/build-cache.md`)
await runMain(
  defineCommand({
    args: {
      directory: { description: "The package directory to build, absolute", required: true, type: "positional" },
    },
    meta: { description: "Restore a package's dist from the build cache, or build and store it", name: "build-cached" },
    run: ({ args }) => {
      console.info(buildPackageCached(args.directory));
    },
  }),
);
