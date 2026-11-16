import { signSigV4Request } from "#src/services/sigv4/signSigV4Request";
import { describe, expect, test } from "vitest";

describe(signSigV4Request, () => {
  // AWS's own example of a header-signed S3 GET, from "Authenticating Requests: Using the Authorization Header", signed on
  // 2013-05-24
  const credentials = {
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    region: "us-east-1",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    service: "s3",
  };
  const signedAt = new Date(Temporal.Duration.from({ days: 15_849 }).total("milliseconds"));

  test("#39 signs AWS's example GET with a range to its published signature", async () => {
    expect.hasAssertions();

    const headers = await signSigV4Request(credentials, {
      headers: {
        Range: "bytes=0-9",
        "X-Amz-Content-Sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
      method: "GET",
      signedAt,
      url: "https://examplebucket.s3.amazonaws.com/test.txt",
    });

    expect(headers.get("Authorization")).toBe(
      "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41",
    );
  });

  test("#36 leaves the payload unsigned when the request names no hash, so a body is sent unread", async () => {
    expect.hasAssertions();

    const headers = await signSigV4Request(credentials, {
      method: "PUT",
      signedAt,
      url: "https://examplebucket.s3.amazonaws.com/a",
    });

    expect(headers.get("X-Amz-Content-Sha256")).toBe("UNSIGNED-PAYLOAD");
  });
});
