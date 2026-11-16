import { presignSigV4Url } from "#src/services/sigv4/presignSigV4Url";
import { describe, expect, test } from "vitest";

describe(presignSigV4Url, () => {
  // AWS's own example of a presigned S3 GET, from "Authenticating Requests: Using Query Parameters", signed on 2013-05-24
  const credentials = {
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    region: "us-east-1",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    service: "s3",
  };
  const signedAt = new Date(Temporal.Duration.from({ days: 15_849 }).total("milliseconds"));
  const url = "https://examplebucket.s3.amazonaws.com/test.txt";
  const expiresInMs = Temporal.Duration.from({ days: 1 }).total("milliseconds");

  test("#46 #73 signs AWS's example at the time given to its published signature, the expiry in the query alone", async () => {
    expect.hasAssertions();

    const presignedUrl = await presignSigV4Url(credentials, { expiresInMs, method: "GET", signedAt, url });

    expect(presignedUrl).toBe(
      "https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404",
    );
  });

  test("#83 #85 sends the query as it was signed, a space as %20 and a star escaped", async () => {
    expect.hasAssertions();

    const withDisposition = new URL(url);
    withDisposition.searchParams.set("response-content-disposition", 'attachment; filename="a b*.txt"');
    const presignedUrl = new URL(
      await presignSigV4Url(credentials, { expiresInMs, method: "GET", signedAt, url: withDisposition }),
    );

    expect(presignedUrl.search).toContain("response-content-disposition=attachment%3B%20filename%3D%22a%20b%2A.txt%22");
  });

  test("#55 #74 signs every header given, which the request must then send", async () => {
    expect.hasAssertions();

    const presignedUrl = new URL(
      await presignSigV4Url(credentials, {
        expiresInMs,
        headers: { "Content-Length": "2", "Content-Type": "image/png" },
        method: "PUT",
        signedAt,
        url,
      }),
    );

    expect(presignedUrl.searchParams.get("X-Amz-SignedHeaders")).toBe("content-length;content-type;host");
  });

  test("refuses a lifetime past the seven days S3 allows", async () => {
    expect.hasAssertions();

    await expect(
      presignSigV4Url(credentials, {
        expiresInMs: Temporal.Duration.from({ days: 7, milliseconds: 1 }).total("milliseconds"),
        method: "GET",
        url,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: presigned url, expires in 604800001 ms, outside 1 s to 604800000 ms]`,
    );
  });
});
