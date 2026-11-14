import { getR2ObjectPath } from "#src/services/cutover/cloudflare/r2/getR2ObjectPath";

// The URL of an object, or of a bucket's listing when the key is empty, with its query parameters in the order given
export const buildR2Url = (endpoint: string, bucket: string, key: string, query: Record<string, string>): URL => {
  const url = new URL(getR2ObjectPath(bucket, key), endpoint);
  for (const [name, value] of Object.entries(query)) url.searchParams.set(name, value);
  return url;
};
