import type { HostedAssetObject } from "hosted-assets";

import { describe } from "vitest";

// A lock entry for the record a key names: the key is its scope, and the sha256 is the one the test names the record by
export const createHostedAssetLockObject = (key: string, sha256: string): HostedAssetObject => ({
  bytes: 0,
  extension: ".json",
  scope: key,
  sha256,
});

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("createHostedAssetLockObject");
