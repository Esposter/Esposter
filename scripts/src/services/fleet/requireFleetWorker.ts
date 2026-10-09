import { WORKER_NAME_REGEX } from "#src/services/fleet/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The worker a command acts for: its `--worker`, else FLEET_WORKER. A claim or a hold names one, so neither may run
// Without it. Its name is a pid file's name and the half after the slash in `machine/worker`, so it is letters,
// Digits and dashes only: a slash made a hold write its pid under a missing folder and crash, leaving its claim unrenewed
export const requireFleetWorker = (argument: string): string => {
  const worker = argument || process.env.FLEET_WORKER || "";
  if (!WORKER_NAME_REGEX.test(worker))
    throw new InvalidOperationError(
      Operation.Read,
      "worker",
      `--worker or FLEET_WORKER names the worker that holds it, in letters, digits and dashes; got "${worker}"`,
    );
  return worker;
};
