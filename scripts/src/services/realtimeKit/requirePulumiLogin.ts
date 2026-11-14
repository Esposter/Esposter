import { InvalidOperationError, Operation, getResultAsync, noop } from "@esposter/shared";
import { execFileAsync } from "@esposter/shared-node/child-process";

// Refused before any read, so a missing login is not taken for an ESC key that is absent (see readEscValue)
export const requirePulumiLogin = async (): Promise<void> => {
  (await getResultAsync(() => execFileAsync("pulumi", ["whoami"], { encoding: "utf8" }))).match(noop, () => {
    throw new InvalidOperationError(Operation.Read, "pulumi", "is not logged in: run pulumi login first");
  });
};
