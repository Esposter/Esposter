import { parseListBucketResult } from "#src/services/cloudflare/parseListBucketResult";
import { describe, expect, test } from "vitest";

const LAST_MODIFIED = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")).toISOString();
const TRUNCATED_LISTING = `<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult><IsTruncated>true</IsTruncated><NextContinuationToken>token-2</NextContinuationToken><Contents><Key>object/a&amp;b.json</Key><LastModified>${LAST_MODIFIED}</LastModified></Contents></ListBucketResult>`;

describe(parseListBucketResult, () => {
  test("reads each key and the instant it was written, decoding the entities a key carries", () => {
    expect.hasAssertions();

    const { objects } = parseListBucketResult(TRUNCATED_LISTING);

    expect(objects).toStrictEqual([{ key: "object/a&b.json", lastModified: new Date(LAST_MODIFIED) }]);
  });

  test("names the next page only when the listing is truncated", () => {
    expect.hasAssertions();

    expect(parseListBucketResult(TRUNCATED_LISTING).nextContinuationToken).toBe("token-2");
    expect(
      parseListBucketResult("<ListBucketResult><IsTruncated>false</IsTruncated></ListBucketResult>")
        .nextContinuationToken,
    ).toBeUndefined();
  });
});
