import { StorageBucket } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

import { createPresignedPutUrl } from "#src/services/storage/createPresignedPutUrl";

describe(createPresignedPutUrl, () => {
  const credentials = {
    accessKeyId: "accessKeyId",
    accountId: "accountId",
    bucketPrefix: "",
    secretAccessKey: "secretAccessKey",
  };

  test("signs a PUT for the write window on the account's S3 endpoint, encoding each key segment", async () => {
    expect.hasAssertions();

    const url = new URL(
      await createPresignedPutUrl(credentials, StorageBucket.MessageAssets, "room/id|a#b?c", "image/png"),
    );

    expect(url.origin).toBe("https://accountId.r2.cloudflarestorage.com");
    expect(url.pathname).toBe("/message-assets/room/id%7Ca%23b%3Fc");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("3600");
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toContain("content-type");
  });

  // A development account's buckets carry a prefix, and the signed url has to name the bucket the account really has
  test("names the bucket with the environment's prefix", async () => {
    expect.hasAssertions();

    const url = new URL(
      await createPresignedPutUrl(
        { ...credentials, bucketPrefix: "dev-" },
        StorageBucket.MessageAssets,
        "key",
        "image/png",
      ),
    );

    expect(url.pathname).toBe("/dev-message-assets/key");
  });
});
