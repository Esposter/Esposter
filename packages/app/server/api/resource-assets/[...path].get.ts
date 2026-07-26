import { dayjs } from "#shared/services/dayjs";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { auth } from "@@/server/auth";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { db } from "@@/server/db";
import { standardRateLimiter } from "@@/server/services/rateLimiter/standardRateLimiter";
import { getIpAddress } from "@@/server/services/request/getIpAddress";
import {
  RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS,
  RESOURCE_ASSET_SAS_DURATION,
} from "@@/server/services/resource/constants";
import { generateReadSasUrl } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, ID_SEPARATOR, noop } from "@esposter/shared";
import { lookup } from "mime-types";
import { extname } from "node:path";
import { RateLimiterRes } from "rate-limiter-flexible";

// Serves the stable asset urls content embeds (/api/resource-assets/{blobName}) by authorizing the caller
// And 302-redirecting to a freshly signed minutes-scale SAS — content never carries a signature, so nothing
// In it can expire or leak a long-lived grant
export default defineEventHandler(async (event) => {
  const encodedPath = getRouterParam(event, "path");
  const resourceAssetPath = encodedPath === undefined ? undefined : parseResourceAssetPath(encodedPath);
  if (!resourceAssetPath) throw createError({ statusCode: 400 });
  const { blobName, isPublished, resourceId } = resourceAssetPath;

  const getSessionPayload = await auth.api.getSession({ headers: event.headers });
  if (IS_PRODUCTION) {
    const ipAddress = getIpAddress(event.node.req);
    if (ipAddress)
      await getResultAsync(() =>
        standardRateLimiter.consume(
          getSessionPayload ? getSessionPayload.user.id : `${AzureContainer.ResourceAssets}${ID_SEPARATOR}${ipAddress}`,
        ),
      ).match(noop, (error) => {
        if (error instanceof RateLimiterRes) throw createError({ statusCode: 429 });
        throw error;
      });
    else
      console.warn(
        "[RateLimiter] Could not determine IP address. Bypassing middleware... This is expected for local production builds.",
      );
  }

  // What "the caller owns this resource" means must have exactly one definition — both branches fall back to
  // It, and a change made to only one of them would silently open or close access for a single asset kind
  const assertOwnsResource = async () => {
    const resource = await db.query.resources.findFirst({
      where: { deletedAt: { isNull: true }, id: { eq: resourceId }, userId: { eq: getSessionPayload?.user.id } },
    });
    if (!resource) throw createError({ statusCode: 404 });
  };

  if (isPublished) {
    // Published assets must stay anonymous-capable while a publication row exists: published views render in
    // A sandboxed srcdoc iframe whose opaque origin sends no cookies with asset requests. Without the row the
    // Owner can still preview retained snapshots (the view route's version query param).
    //
    // Read per request, never cached: unpublish revokes anonymous access, and a cache would keep serving the
    // Assets of an unpublished resource for its whole lifetime. Revocation has to be immediate to be a control
    const publication = await db.query.resourcePublications.findFirst({ where: { resourceId: { eq: resourceId } } });
    if (!publication) {
      if (!getSessionPayload) throw createError({ statusCode: 404 });
      await assertOwnsResource();
    }
  } else {
    // Working-copy assets are only ever rendered inside the owner's editor (same-origin, cookies present)
    if (!getSessionPayload) throw createError({ statusCode: 401 });
    await assertOwnsResource();
  }

  // No existence probe — Azure itself 404s a missing blob when the redirect is followed
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const sasUrl = await generateReadSasUrl(containerClient.getBlockBlobClient(blobName), {
    contentType: lookup(extname(blobName).toLowerCase()) || undefined,
    expiresOn: dayjs().add(RESOURCE_ASSET_SAS_DURATION).toDate(),
  });
  setResponseHeader(event, "Cache-Control", `private, max-age=${RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS}`);
  return sendRedirect(event, sasUrl, 302);
});
