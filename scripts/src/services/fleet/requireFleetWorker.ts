import { InvalidOperationError, Operation } from "@esposter/shared";

// The worker a command acts for: its `--worker`, else FLEET_WORKER. A claim or a hold names one, so neither may run without it
export const requireFleetWorker = (argument: string): string => {
  const worker = argument || process.env.FLEET_WORKER || "";
  if (worker === "")
    throw new InvalidOperationError(
      Operation.Read,
      "worker",
      "--worker or FLEET_WORKER names the worker that holds it",
    );
  return worker;
};
