import type { HostedAssetName } from "hosted-assets";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { assertContentAddress, getContentAddress } from "@esposter/shared-node/cache";

// Refuses the bytes of an object unless they hash to the sha256 its name gives it, and, when a lock records one, unless
// They Are that many bytes. The bytes are hashed as they are given, decoded, and never re-serialised, so a body that
// Parses to the Named value but is other bytes is refused too
export const assertHostedAssetBytes = (
  path: string,
  { sha256 }: HostedAssetName,
  bytes: Buffer,
  lockedBytes?: number,
): void => {
  assertContentAddress(path, sha256, getContentAddress(bytes));
  if (lockedBytes !== undefined && bytes.byteLength !== lockedBytes)
    throw new InvalidOperationError(
      Operation.Read,
      path,
      `is ${bytes.byteLength} bytes, not the ${lockedBytes} its lock records`,
    );
};
