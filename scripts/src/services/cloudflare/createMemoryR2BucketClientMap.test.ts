import { createMemoryR2BucketClient } from "#src/services/cloudflare/createMemoryR2BucketClient.test";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { describe } from "vitest";

// Each environment's bucket is its own in-memory store, made fresh for each test
export const createMemoryR2BucketClientMap = () => ({
  [CloudflareEnvironment.Development]: createMemoryR2BucketClient(),
  [CloudflareEnvironment.Production]: createMemoryR2BucketClient(),
});

describe.todo("createMemoryR2BucketClientMap");
