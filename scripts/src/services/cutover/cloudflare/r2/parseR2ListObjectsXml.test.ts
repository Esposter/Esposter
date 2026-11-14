import { parseR2ListObjectsXml } from "#src/services/cutover/cloudflare/r2/parseR2ListObjectsXml";
import { describe, expect, test } from "vitest";

describe(parseR2ListObjectsXml, () => {
  const xml = `<ListBucketResult><IsTruncated>true</IsTruncated><Contents><Key>a&amp;b.txt</Key><Size>3</Size><ETag>&quot;010203&quot;</ETag></Contents><NextContinuationToken>token-1</NextContinuationToken></ListBucketResult>`;

  test("reads each entry's key, size and ETag, and the token the next page is asked from", () => {
    expect.hasAssertions();

    expect(parseR2ListObjectsXml(xml)).toStrictEqual({
      nextContinuationToken: "token-1",
      objects: [{ etag: "010203", key: "a&b.txt", size: 3 }],
    });
  });

  test("reads an empty listing as no objects and no next page", () => {
    expect.hasAssertions();

    expect(parseR2ListObjectsXml("<ListBucketResult></ListBucketResult>")).toStrictEqual({
      nextContinuationToken: "",
      objects: [],
    });
  });
});
