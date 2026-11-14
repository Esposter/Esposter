import type { StorageCredentials } from "#src/models/storage/StorageCredentials";
import type { StorageBucket } from "@esposter/db-schema";

import { getR2BucketName } from "#src/services/storage/getR2BucketName";
import { AwsClient } from "aws4fetch";

// Signed for the account's S3 endpoint with the R2 token, since a binding cannot sign a url. The key is encoded one
// Segment at a time, so a `#` or `?` in a filename stays part of the key rather than ending the url early
export const presignStorageUrl = async (
  { accessKeyId, accountId, environment, secretAccessKey }: StorageCredentials,
  method: "GET" | "PUT",
  bucket: StorageBucket,
  objectKey: string,
  {
    expiresInMs,
    headers,
    searchParams,
  }: { expiresInMs: number; headers?: Record<string, string>; searchParams?: Record<string, string> },
): Promise<string> => {
  const encodedKey = objectKey.split("/").map(encodeURIComponent).join("/");
  const url = new URL(
    `https://${accountId}.r2.cloudflarestorage.com/${getR2BucketName(environment, bucket)}/${encodedKey}`,
  );
  url.searchParams.set("X-Amz-Expires", String(expiresInMs / 1000));
  for (const [name, value] of Object.entries(searchParams ?? {})) url.searchParams.set(name, value);
  const client = new AwsClient({ accessKeyId, region: "auto", secretAccessKey, service: "s3" });
  const { url: presignedUrl } = await client.sign(url, { aws: { signQuery: true }, headers, method });
  return presignedUrl;
};
