import { db } from "#server/db";
import { readSession } from "#server/services/auth/readSession";
import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "#server/services/rateLimiter/constants";
import { getIpAddress } from "#server/services/request/getIpAddress";
import { checkIsResourceAssetReadable } from "#server/services/resource/checkIsResourceAssetReadable";
import {
  RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS,
  RESOURCE_ASSET_SAS_DURATION_MS,
} from "#server/services/resource/constants";
import { readResourceAccess } from "#server/services/resource/readResourceAccess";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { createPresignedGetUrl } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";
import { env } from "cloudflare:workers";
import { createError, defineEventHandler, getRequestIP, sendRedirect } from "nuxt/server";

// Serves the stable asset urls content embeds (/api/resource-assets/{blobName}) by authorizing the caller
// And 302-redirecting to a freshly presigned minutes-scale url — content never carries a signature, so nothing
// In it can expire or leak a long-lived grant
export default defineEventHandler(async (event) => {
  // Read off the request url's path, which stays percent-encoded: the form `parseResourceAssetPath` needs, since it
  // Decodes per segment so a `%2F` can never widen the directory the caller was authorized for, and a filename
  // Legally holding a `?` stays one segment rather than ending at it
  const encodedPath = event.url.pathname.slice(`${RESOURCE_ASSETS_URL_PREFIX}/`.length);
  const resourceAssetPath = encodedPath ? parseResourceAssetPath(encodedPath) : undefined;
  if (!resourceAssetPath) throw createError({ status: 400 });
  const { blobName } = resourceAssetPath;

  const getSessionPayload = await readSession(event.req.headers);
  if (IS_PRODUCTION) {
    // Its own binding, because one published page issues a request per embedded asset and that spend must not come
    // Out of the caller's API budget (see openspec/specs/architecture/rate-limiting/design.md)
    const rateLimiterKey = getSessionPayload?.user.id ?? getIpAddress(event.req.headers, getRequestIP(event) ?? "");
    if (!rateLimiterKey) console.warn(RATE_LIMITER_BYPASS_LOG_MESSAGE);
    else if (!(await env.RATE_LIMITER_ASSET.limit({ key: rateLimiterKey })).success) throw createError({ status: 429 });
  }
  // A stranger is refused as unauthenticated whatever the asset is, so a working-only image and a missing one look the
  // Same to them. A signed-in caller who may not read it gets a 404.
  //
  // Published views render in a sandboxed srcdoc iframe whose opaque origin sends no cookies with asset requests, so an
  // Owner's own render inside that iframe is refused the same way; only a direct request for the asset url reaches the
  // Owner fallback. That is what unpublish revoking anonymous access costs, and the point of the control
  const userId = getSessionPayload?.user.id;
  const resourceAccess = await readResourceAccess(db, resourceAssetPath.resourceId, userId);
  if (!(await checkIsResourceAssetReadable(db, resourceAssetPath, resourceAccess)))
    throw createError({ status: userId ? 404 : 401 });
  // No existence probe — R2 itself answers a missing object with a 404 when the redirect is followed
  // The object's content type is the uploader's and its name carries no extension, so a navigation to the asset would
  // Render whatever the uploader sent on the bucket's origin. An attachment downloads on navigation, and an <img> or
  // <video> still embeds it, since those ignore Content-Disposition
  const presignedUrl = await createPresignedGetUrl(getStorageCredentials(), StorageBucket.ResourceAssets, blobName, {
    contentDisposition: "attachment",
    expiresInMs: RESOURCE_ASSET_SAS_DURATION_MS,
  });
  event.res.headers.set("Cache-Control", `private, max-age=${RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS}`);
  return sendRedirect(event, presignedUrl, 302);
});
