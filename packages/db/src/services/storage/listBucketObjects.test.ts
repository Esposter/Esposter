import { listBucketObjects } from "#src/services/storage/listBucketObjects";
import { describe, expect, test, vi } from "vitest";

describe(listBucketObjects, () => {
  const BUCKET_URL = "https://bucket.example.com/";
  const LAST_MODIFIED = "1970-01-01T00:00:00.000Z";
  const createListing = (key: string, nextToken?: string) =>
    `<ListBucketResult><IsTruncated>${nextToken !== undefined}</IsTruncated>${nextToken === undefined ? "" : `<NextContinuationToken>${nextToken}</NextContinuationToken>`}<Contents><Key>${key}</Key><LastModified>${LAST_MODIFIED}</LastModified></Contents></ListBucketResult>`;

  test("follows each page's token to the last page, under the prefix", async () => {
    expect.hasAssertions();

    const fetchBucket = vi
      .fn<(url: string) => Promise<Response>>()
      .mockResolvedValueOnce(new Response(createListing("a/1", "token")))
      .mockResolvedValueOnce(new Response(createListing("a/2")));
    const objects = await listBucketObjects(fetchBucket, BUCKET_URL, "a/");

    expect(objects.map(({ key }) => key)).toStrictEqual(["a/1", "a/2"]);
    expect(fetchBucket.mock.calls.map(([url]) => url)).toStrictEqual([
      `${BUCKET_URL}?list-type=2&prefix=a%2F`,
      `${BUCKET_URL}?list-type=2&prefix=a%2F&continuation-token=token`,
    ]);
  });

  test("throws on a refused page rather than reading it as an empty bucket", async () => {
    expect.hasAssertions();

    const fetchBucket = vi
      .fn<(url: string) => Promise<Response>>()
      .mockResolvedValueOnce(new Response(null, { status: 403 }));

    await expect(listBucketObjects(fetchBucket, BUCKET_URL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://bucket.example.com/?list-type=2, responds 403]`,
    );
  });
});
