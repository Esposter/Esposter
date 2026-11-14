import { getBucket } from "#server/services/storage/getBucket";
import { parsePublicBucket } from "#server/services/storage/parsePublicBucket";
import { PUBLIC_ASSET_CACHE_MAX_AGE_SECONDS } from "#server/services/storage/constants";
import { createError, defineEventHandler } from "nuxt/server";

// Serves an object of a public bucket at its stable url, `${PUBLIC_ASSETS_BASE_URL}/{bucket}/{key}`, which the edge caches.
// A private bucket is never served here: its objects are read through a presigned url, and a missing key is a 404 either way
export default defineEventHandler(async (event) => {
  const storageBucket = parsePublicBucket(event.context.params?.bucket ?? "");
  const key = event.context.params?.key;
  if (!storageBucket || !key) throw createError({ status: 404 });

  const object = await getBucket(storageBucket).get(key);
  if (!object) throw createError({ status: 404 });

  // R2 writes the object's own content type, encoding and the rest of its stored HTTP metadata
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", `public, max-age=${PUBLIC_ASSET_CACHE_MAX_AGE_SECONDS}`);
  headers.set("ETag", object.httpEtag);
  return new Response(object.body, { headers });
});
