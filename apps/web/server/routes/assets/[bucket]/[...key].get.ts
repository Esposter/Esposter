import { PUBLIC_ASSET_CACHE_MAX_AGE_SECONDS } from "#server/services/storage/constants";
import { getBucket } from "#server/services/storage/getBucket";
import { parsePublicBucket } from "#server/services/storage/parsePublicBucket";
import { parsePublicKey } from "#server/services/storage/parsePublicKey";
import { createError, defineEventHandler } from "nuxt/server";

// Serves an object of a public bucket at its stable url, `${PUBLIC_ASSETS_BASE_URL}/{bucket}/{key}`.
// The edge caches it.
// A private bucket is never served here: its objects are read through a presigned url.
// A missing key is a 404 either way.
export default defineEventHandler(async (event) => {
  const storageBucket = parsePublicBucket(event.context.params?.bucket ?? "");
  const key = parsePublicKey(event.context.params?.key ?? "");
  if (!storageBucket || !key) throw createError({ status: 404 });

  const object = await getBucket(storageBucket).get(key);
  if (!object) throw createError({ status: 404 });

  // The object's own stored metadata is written onto the response by name, not through `writeHttpMetadata`.
  // That helper takes Workers `Headers`, which is not the server program's type.
  // So the body stream is returned for h3 to send.
  const { contentDisposition, contentEncoding, contentLanguage, contentType } = object.httpMetadata ?? {};
  const metadataHeaders = {
    "Content-Disposition": contentDisposition,
    "Content-Encoding": contentEncoding,
    "Content-Language": contentLanguage,
    "Content-Type": contentType,
  };
  for (const [name, value] of Object.entries(metadataHeaders)) if (value) event.res.headers.set(name, value);
  // The app reads public data such as the game's from this host by fetch, which is cross-origin, and every object here
  // Is Public, so any origin may read it
  event.res.headers.set("Access-Control-Allow-Origin", "*");
  event.res.headers.set("Cache-Control", `public, max-age=${PUBLIC_ASSET_CACHE_MAX_AGE_SECONDS}`);
  event.res.headers.set("ETag", object.httpEtag);
  return object.body;
});
