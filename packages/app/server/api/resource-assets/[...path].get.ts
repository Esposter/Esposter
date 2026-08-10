import { dayjs } from "#shared/services/dayjs";
import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { auth } from "@@/server/auth";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { db } from "@@/server/db";
import { assetRateLimiter } from "@@/server/services/rateLimiter/assetRateLimiter";
import { getIsRateLimitExceeded } from "@@/server/services/rateLimiter/getIsRateLimitExceeded";
import { getIpAddress } from "@@/server/services/request/getIpAddress";
import {
  RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS,
  RESOURCE_ASSET_SAS_DURATION,
} from "@@/server/services/resource/constants";
import { getIsResourceAssetReadable } from "@@/server/services/resource/getIsResourceAssetReadable";
import { generateReadSasUrl } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, ID_SEPARATOR, noop } from "@esposter/shared";
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
    // Its own limiter, and its own namespace within it: a signed-in viewer's key was the bare user id, the
    // Same key every tRPC call consumes, so opening one published page full of images spent that page's
    // Asset requests out of the budget for the user's actual API calls and 429'd the app around them. One
    // Rendered page is many asset requests by construction, and anonymous viewers of it share an egress
    // Address — so neither the key nor the procedure budget describes this traffic (see assetRateLimiter).
    // An authed viewer is keyed on its user id, which is available whether or not an address is, so only the
    // Anonymous key depends on the address — bypassing both would leave every signed-in request unbudgeted on
    // A deployment whose ingress header never arrives
    const rateLimiterKey = getSessionPayload?.user.id ?? getIpAddress(event.node.req);
    if (rateLimiterKey)
      await getResultAsync(() =>
        assetRateLimiter.consume(`${AzureContainer.ResourceAssets}${ID_SEPARATOR}${rateLimiterKey}`),
      ).match(noop, (error) => {
        if (getIsRateLimitExceeded(error)) throw createError({ statusCode: 429 });
        throw error;
      });
    else
      console.warn(
        "[RateLimiter] Could not determine IP address for an anonymous request. Bypassing middleware... This is expected for local production builds.",
      );
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
  if (!(await getIsResourceAssetReadable(db, resourceAssetPath, getSessionPayload?.user.id)))
    throw createError({ statusCode: 404 });
  // No existence probe — Azure itself 404s a missing blob when the redirect is followed
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const sasUrl = await generateReadSasUrl(containerClient.getBlockBlobClient(blobName), {
    contentType: lookup(extname(blobName).toLowerCase()) || undefined,
    expiresOn: dayjs().add(RESOURCE_ASSET_SAS_DURATION).toDate(),
  });
  setResponseHeader(event, "Cache-Control", `private, max-age=${RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS}`);
  return sendRedirect(event, sasUrl, 302);
});
