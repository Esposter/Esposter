import { useContainerBaseUrl } from "@@/server/composables/azure/container/useContainerBaseUrl";
import { AzureContainer } from "@esposter/db-schema";
// Blob urls never contain quotes or backslashes, so stopping at either lets the regex match urls
// Embedded in raw html/css strings and in JSON-serialized content (where `\"` ends the string) alike.
// The blob name carries the uploaded filename verbatim, so the path may hold `'`, `(` or `)` and can only
// End at a quote — but the SAS query that follows it cannot, so bounding the query to its own charset is
// What stops a match inside `url('…?sig=…')` from swallowing the closing `')` and the rest of the stylesheet
const SAS_QUERY_PATTERN = "(?:\\?[\\w%&=+:.,~-]*)?";

export const useBlobUrlSearchRegex = (blobUrl?: string) => {
  const containerBaseUrl = useContainerBaseUrl();
  return new RegExp(
    `${blobUrl ? RegExp.escape(blobUrl) : `${containerBaseUrl}/${AzureContainer.ResourceAssets}`}[^"\\\\?]*${SAS_QUERY_PATTERN}`,
    "gu",
  );
};
