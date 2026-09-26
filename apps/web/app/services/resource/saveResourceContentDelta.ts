import type { ContentBaseline } from "@/models/resource/ContentBaseline";
import type { ResourceRouter } from "@/models/resource/ResourceRouter";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { MAX_REQUEST_SIZE } from "#shared/services/app/constants";
import { CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE } from "#shared/services/resource/constants";
import { getRequestBodyByteLength } from "@/services/trpc/getRequestBodyByteLength";
import { getResultAsync } from "@esposter/shared";

// A large document saved as a delta against the stored bytes this client holds. Undefined whenever the delta
// Cannot be used — the encoder failed, the edit was too large for one body, or the resource's content moved on
// Under another device, a restore or a deploy — and the caller saves in full within the same queued save, so a
// Delta that does not apply costs the owner nothing but the full upload it was trying to avoid
export const saveResourceContentDelta = async (
  resourceRouter: ResourceRouter<ResourceType>,
  contentBytes: Uint8Array<ArrayBuffer>,
  contentBaseline: ContentBaseline,
  { contentVersion, id }: Pick<Resource, "contentVersion" | "id">,
): Promise<Resource | undefined> => {
  const deltaBytes = await getResultAsync(async () => {
    const { encodeContentDelta } = await import("@/services/resource/encodeContentDelta");
    return encodeContentDelta(contentBytes, contentBaseline.bytes);
  }).match(
    (bytes) => bytes,
    (error) => {
      console.error(error);
      return undefined;
    },
  );
  if (!deltaBytes) return undefined;

  const input = { baselineHash: contentBaseline.hash, contentVersion, delta: deltaBytes.toBase64(), id };
  if (getRequestBodyByteLength(input) >= MAX_REQUEST_SIZE) return undefined;

  return getResultAsync(() => resourceRouter.saveResourceContentDelta.mutate(input)).match<Resource | undefined>(
    (savedResource) => savedResource,
    (error) => {
      if (error.message === CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE) return undefined;
      throw error;
    },
  );
};
