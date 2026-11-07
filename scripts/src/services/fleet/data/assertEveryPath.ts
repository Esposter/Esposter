import { InvalidOperationError, Operation } from "@esposter/shared";

// Throws on the first path the check refuses, naming it with the reason, so a command reads nothing once any path is out
export const assertEveryPath = (paths: readonly string[], check: (path: string) => boolean, reason: string): void => {
  for (const path of paths) if (!check(path)) throw new InvalidOperationError(Operation.Read, path, reason);
};
