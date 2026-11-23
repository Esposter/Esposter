import { provisionRealtimeKit } from "#src/services/realtimeKit/provisionRealtimeKit";
import { runCommand } from "#src/services/timing/runCommand";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { defineCommand } from "citty";

// `pnpm -C scripts realtimekit:provision --environment <dev|prod> [--dry-run]`. Idempotent: it creates what is missing
// And Changes nothing that matches, so a second run plans nothing. It calls RealtimeKit with the environment's token
// From ESC, and writes the app id the Workers read back to ESC, never to the log
await runCommand(
  defineCommand({
    args: {
      "dry-run": {
        default: false,
        description: "Print what would be created or updated, and write nothing",
        type: "boolean",
      },
      environment: {
        description: "The environment to provision: dev or prod",
        options: Object.values(CloudflareEnvironment),
        required: true,
        type: "enum",
      },
    },
    meta: {
      description: "Create or update one environment's RealtimeKit app, presets and webhook",
      name: "realtimekit:provision",
    },
    run: ({ args }) => provisionRealtimeKit(args.environment, args["dry-run"]),
  }),
);
