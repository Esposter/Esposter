import { runCommand } from "#src/services/timing/runCommand";
import { checkWorkerSecrets } from "#src/services/workerSecrets/checkWorkerSecrets";
import { WORKER_ENVIRONMENT_SCHEMAS } from "#src/services/workerSecrets/constants";
import { readWorkerSecrets } from "#src/services/workerSecrets/readWorkerSecrets";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

// `pnpm worker-secrets:check <worker> <file>` checks the secrets a Worker's deploy is about to upload against its schema.
// It runs before the Worker deploys, so a value the schema refuses stops the deploy. It names each refused variable, never a value
await runCommand(
  defineCommand({
    args: {
      worker: {
        description: "The Worker's key in .github/worker-secrets.json, e.g. `web`",
        required: true,
        type: "positional",
      },
      file: {
        description: "The secrets file the deploy gathered for that Worker, a JSON object of each name to its value",
        required: true,
        type: "positional",
      },
    },
    meta: {
      description:
        "Check one Worker's secrets against its environment schema, and fail naming each variable it refuses",
      name: "worker-secrets:check",
    },
    run: ({ args }) => {
      const schema = WORKER_ENVIRONMENT_SCHEMAS.get(args.worker);
      if (!schema)
        throw new InvalidOperationError(
          Operation.Read,
          args.worker,
          "it has no environment schema in WORKER_ENVIRONMENT_SCHEMAS, so its secrets cannot be checked",
        );

      const refusals = checkWorkerSecrets(schema, readWorkerSecrets(args.file));
      if (refusals.length > 0)
        throw new InvalidOperationError(
          Operation.Read,
          `${args.worker} secrets`,
          `its environment schema refuses ${refusals.join("; ")}`,
        );
      console.info(`${args.worker}: its secrets pass its environment schema`);
    },
  }),
);
