import type { StorageBucket } from "@esposter/db-schema";

import { getBucket } from "#src/services/storage/getBucket";
import { listBlobNames } from "@esposter/db";
import { describe } from "vitest";

export const readBlobNames = async (storageBucket: StorageBucket): Promise<string[]> =>
  listBlobNames(getBucket(storageBucket), "");

describe.todo("readBlobNames");
