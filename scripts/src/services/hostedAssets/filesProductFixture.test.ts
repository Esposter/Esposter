import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { StorageBucket } from "@esposter/db-schema";
import { describe } from "vitest";

// The fields every files product fixture shares, so a suite spreads only its own source over them
export const filesProductBase = {
  bucket: StorageBucket.PublicHostedAssets,
  lockPath: TEST_FILENAME,
  lockRepositoryPath: TEST_FILENAME,
  name: TEST_FILENAME,
  scopes: [TEST_FILENAME],
};

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("files product fixture");
