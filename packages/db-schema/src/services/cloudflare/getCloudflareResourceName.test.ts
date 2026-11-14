import { CloudflareAssetType } from "#src/models/cloudflare/CloudflareAssetType";
import { CloudflareEnvironment } from "#src/models/cloudflare/CloudflareEnvironment";
import { getCloudflareResourceName } from "#src/services/cloudflare/getCloudflareResourceName";
import { SITE_NAME } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getCloudflareResourceName, () => {
  test("spells environment, asset type, workload and purpose in order", () => {
    expect.hasAssertions();

    expect(
      getCloudflareResourceName(CloudflareEnvironment.Production, CloudflareAssetType.R2Bucket, "message-assets"),
    ).toBe(`prod-r2-${SITE_NAME.toLowerCase()}-message-assets`);
  });
});
