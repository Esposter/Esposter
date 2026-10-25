import { WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { getMockSasUrl } from "azure-mock";
import { describe } from "vitest";

// The write SAS a blob url is minted with, expiring one write window after the test clock's now
export const getExpectedWriteSasUrl = (blobUrl: string) =>
  getMockSasUrl(blobUrl, "w", "b", new Date(Date.now() + WRITE_SAS_DURATION_MS));

describe.todo("getExpectedWriteSasUrl");
