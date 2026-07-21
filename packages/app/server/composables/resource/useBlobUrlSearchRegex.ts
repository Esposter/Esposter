import { useContainerBaseUrl } from "@@/server/composables/azure/container/useContainerBaseUrl";
import { AzureContainer } from "@esposter/db-schema";
// Every url we hand out is canonicalized by `encodeBlobUrl`, which percent-encodes the `!'()*` that Azure's
// Own encoder leaves literal — so a blob url can no longer contain any character that delimits it in content.
// Terminating on all of them at once is what makes one regex correct for urls embedded in html attributes,
// In css `url('…')` and `url(…)`, and in JSON-serialized content (where `\"` ends the string) alike:
// The match can neither stop short inside a SAS query nor run past the delimiter that closes it
const BLOB_URL_TERMINATOR_PATTERN = String.raw`[^"'()<>\s\\]*`;

export const useBlobUrlSearchRegex = (blobUrl?: string) => {
  const containerBaseUrl = useContainerBaseUrl();
  return new RegExp(
    `${blobUrl ? RegExp.escape(blobUrl) : `${containerBaseUrl}/${AzureContainer.ResourceAssets}`}${BLOB_URL_TERMINATOR_PATTERN}`,
    "gu",
  );
};
