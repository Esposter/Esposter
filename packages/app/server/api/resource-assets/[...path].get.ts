import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { auth } from "@@/server/auth";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { db } from "@@/server/db";
import { assetRateLimiter } from "@@/server/services/rateLimiter/assetRateLimiter";
import { checkIsRateLimitExceeded } from "@@/server/services/rateLimiter/checkIsRateLimitExceeded";
import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "@@/server/services/rateLimiter/constants";
import { getIpAddress } from "@@/server/services/request/getIpAddress";
import { checkIsResourceAssetReadable } from "@@/server/services/resource/checkIsResourceAssetReadable";
import {
  RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS,
  RESOURCE_ASSET_SAS_DURATION_MS,
} from "@@/server/services/resource/constants";
import { generateReadSasUrl } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { lookup } from "mime-types";
import { extname } from "node:path";

// Serves the stable asset urls content embeds (/api/resource-assets/{blobName}) by authorizing the caller
// And 302-redirecting to a freshly signed minutes-scale SAS — content never carries a signature, so nothing
// In it can expire or leak a long-lived grant
export default defineEventHandler(async (event) => {
  // Read off the raw request target, never `getRouterParam`: Nitro decodes the path before routing (h3's
  // `_decodePath`) and its router then cuts everything from the first `?` it finds in that decoded form — so a
  // Filename legally holding one arrives as a truncated blob name that resolves to a 404 nothing reports.
  // The target keeps the percent-encoded form `parseResourceAssetPath` needs, which decodes per segment so a
  // `%2F` can never widen the directory the caller was authorized for
  const requestTarget = event.node.req.url ?? "";
  const queryIndex = requestTarget.indexOf("?");
  const encodedPath = (queryIndex === -1 ? requestTarget : requestTarget.slice(0, queryIndex)).slice(
    `${RESOURCE_ASSETS_URL_PREFIX}/`.length,
  );
  const resourceAssetPath = encodedPath ? parseResourceAssetPath(encodedPath) : undefined;
  if (!resourceAssetPath) throw createError({ statusCode: 400 });
  const { blobName, isPublished } = resourceAssetPath;

  const getSessionPayload = await auth.api.getSession({ headers: event.headers });
  if (IS_PRODUCTION) {
    // Its own limiter, because one published page issues a request per embedded asset and that spend must not
    // Come out of the caller's API budget (see assetRateLimiter)
    const rateLimiterKey = getSessionPayload?.user.id ?? getIpAddress(event.node.req);
    if (rateLimiterKey)
      await getResultAsync(() => assetRateLimiter.consume(rateLimiterKey)).match(noop, (error) => {
        if (checkIsRateLimitExceeded(error)) throw createError({ statusCode: 429 });
        throw error;
      });
    else console.warn(RATE_LIMITER_BYPASS_LOG_MESSAGE);
  }
  // Working-copy assets are only ever rendered inside the owner's editor (same-origin, cookies present), so an
  // Anonymous request for one is a missing credential rather than a missing asset. A published url has no such
  // Distinction — it is anonymous-capable while a publication row exists, and a 401 would leak that the row is
  // Gone — so everything else the predicate refuses is a 404.
  //
  // Published views render in a sandboxed srcdoc iframe whose opaque origin sends no cookies with asset
  // Requests, which is why the owner fallback inside the predicate cannot rescue a render inside that iframe,
  // Only a direct request for the asset url (opening the image in its own tab). Inside the iframe, no row means
  // The images are broken for the owner too; that is what unpublish revoking anonymous access costs, and it is
  // The point of the control
  if (!isPublished && !getSessionPayload) throw createError({ statusCode: 401 });
  if (!(await checkIsResourceAssetReadable(db, resourceAssetPath, getSessionPayload?.user.id)))
    throw createError({ statusCode: 404 });
  // No existence probe — Azure itself 404s a missing blob when the redirect is followed
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const sasUrl = await generateReadSasUrl(containerClient.getBlockBlobClient(blobName), {
    contentType: lookup(extname(blobName).toLowerCase()) || undefined,
    expiresOn: new Date(Date.now() + RESOURCE_ASSET_SAS_DURATION_MS),
  });
  setResponseHeader(event, "Cache-Control", `private, max-age=${RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS}`);
  return sendRedirect(event, sasUrl, 302);
});
