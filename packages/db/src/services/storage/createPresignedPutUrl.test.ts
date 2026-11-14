import { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createPresignedPutUrl } from "#src/services/storage/createPresignedPutUrl";

describe(createPresignedPutUrl, () => {
  // Frozen so two urls signed in one test share a date, leaving the content type as the only input that can differ
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const credentials = {
    accessKeyId: "accessKeyId",
    // Lowercase, as a host is: a URL's origin lowercases its host, so a mixed-case account id is never the origin
    accountId: "accountid",
    environment: CloudflareEnvironment.Production,
    secretAccessKey: "secretAccessKey",
  };

  test("signs a PUT for the write window on the account's S3 endpoint, encoding each key segment", async () => {
    expect.hasAssertions();

    const url = new URL(
      await createPresignedPutUrl(credentials, StorageBucket.MessageAssets, "room/id|a#b?c", "image/png"),
    );

    expect(url.origin).toBe("https://accountid.r2.cloudflarestorage.com");
    expect(url.pathname).toBe("/prod-r2-esposter-message-assets/room/id%7Ca%23b%3Fc");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("3600");
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toContain("content-type");
  });

  // A development account's buckets carry the development environment's name, and the signed url has to name that bucket
  test("names the bucket of the environment the credentials are for", async () => {
    expect.hasAssertions();

    const url = new URL(
      await createPresignedPutUrl(
        { ...credentials, environment: CloudflareEnvironment.Development },
        StorageBucket.MessageAssets,
        "key",
        "image/png",
      ),
    );

    expect(url.pathname).toBe("/dev-r2-esposter-message-assets/key");
  });

  // The content type is in the signature, so a PUT of any other type is one the url's signature does not cover
  test("signs the content type it is given, so a url signed for one type carries another signature for a different one", async () => {
    expect.hasAssertions();

    const pngUrl = new URL(await createPresignedPutUrl(credentials, StorageBucket.MessageAssets, "key", "image/png"));
    const jpegUrl = new URL(await createPresignedPutUrl(credentials, StorageBucket.MessageAssets, "key", "image/jpeg"));

    expect(jpegUrl.searchParams.get("X-Amz-Signature")).not.toBe(pngUrl.searchParams.get("X-Amz-Signature"));
  });
});
