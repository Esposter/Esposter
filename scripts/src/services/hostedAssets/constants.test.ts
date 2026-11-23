import type { HostedAssetSourceFile } from "#src/models/hostedAssets/HostedAssetSourceFile";

import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { StorageBucket } from "@esposter/db-schema";
import { getContentAddress } from "@esposter/shared-node/cache";
import { describe } from "vitest";

// The fields every files product fixture shares, so a suite spreads only its own source over them
export const filesProductBase = {
  bucket: StorageBucket.PublicHostedAssets,
  lockPath: TEST_FILENAME,
  lockRepositoryPath: TEST_FILENAME,
  name: TEST_FILENAME,
  scopes: [TEST_FILENAME],
};

// Two source files of a files product, the second under a folder of its own, as a publish reads them from the folder
const bytesA = Buffer.from(TEST_FILENAME);
const bytesB = Buffer.from("");
export const filesPair: HostedAssetSourceFile[] = [
  { bytes: bytesA, extension: ".png", key: `${TEST_FILENAME}.png`, sha256: getContentAddress(bytesA) },
  { bytes: bytesB, extension: ".png", key: `${TEST_FILENAME}/${TEST_FILENAME}.png`, sha256: getContentAddress(bytesB) },
];

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");
