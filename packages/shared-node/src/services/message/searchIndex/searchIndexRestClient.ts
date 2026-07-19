import type { SearchIndexRestClient } from "@/services/message/searchIndex/models/SearchIndexRestClient";

import { MESSAGES_INDEX, SEARCH_API_VERSION } from "@/services/message/searchIndex/constants";
import { getResultAsync, noop } from "@esposter/shared";
import { z } from "zod";

const searchCountResponseSchema = z.object({ "@odata.count": z.number() });

export const createSearchIndexRestClient = (baseUrl: string, apiKey: string): SearchIndexRestClient => ({
  countDocumentsByRoom: (roomId) =>
    getResultAsync(async () => {
      const response = await fetch(
        `${baseUrl}/indexes/${MESSAGES_INDEX}/docs/search?api-version=${SEARCH_API_VERSION}`,
        {
          body: JSON.stringify({ count: true, filter: `PartitionKey eq '${roomId}'`, search: "*", top: 0 }),
          headers: { "api-key": apiKey, "content-type": "application/json" },
          method: "POST",
        },
      );
      if (!response.ok) throw new Error(`Search count failed with ${response.status}: ${await response.text()}`);
      return searchCountResponseSchema.parse(await response.json())["@odata.count"];
    })
      .orTee(console.error)
      .unwrapOr(0),
  mergeOrUploadDocuments: (documents) =>
    getResultAsync(async () => {
      const response = await fetch(
        `${baseUrl}/indexes/${MESSAGES_INDEX}/docs/index?api-version=${SEARCH_API_VERSION}`,
        {
          body: JSON.stringify({
            value: documents.map((document) => ({ "@search.action": "mergeOrUpload", ...document })),
          }),
          headers: { "api-key": apiKey, "content-type": "application/json" },
          method: "POST",
        },
      );
      if (!response.ok) throw new Error(`Search upload failed with ${response.status}: ${await response.text()}`);
    }).match(noop, console.error),
});
