import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { getStagingContentBlobName } from "@@/server/services/resource/getStagingContentBlobName";
import { readResourceContentDelta } from "@@/server/services/resource/readResourceContentDelta";
import { readStagedResourceContent } from "@@/server/services/resource/readStagedResourceContent";
import { writeResourceContentBlob } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { DEFAULT_COMPRESSION_LEVEL, getWindowLog } from "@esposter/shared";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { createHash } from "node:crypto";
import { constants, gzipSync, zstdCompressSync } from "node:zlib";
import { describe, test } from "vitest";

const BENCH_DOCUMENT_BYTE_COUNTS = [1_000_000, 10_000_000];
// Rows of a Sheet-like document, the one resource type that reaches these sizes
const createDocument = (byteCount: number, editedIndex = -1) =>
  JSON.stringify({
    rows: Array.from({ length: Math.floor(byteCount / 64) }, (_value, index) => ({
      data: { a: index, b: index === editedIndex ? "edited" : `${index % 97}` },
      id: `${index}`,
    })),
  });
// Both commits read what the other transport already paid for elsewhere — the staged one a download of its gzip,
// The delta one a download of the stored document — so the parse every save pays anyway is the floor each is read
// Against, and the gap between them is what the transport itself costs the server
describe(readStagedResourceContent, () => {
  test.for(BENCH_DOCUMENT_BYTE_COUNTS)("%i bytes", async (byteCount, { bench }) => {
    const id = crypto.randomUUID();
    const baseline = Buffer.from(createDocument(byteCount));
    const content = createDocument(byteCount, 0);
    const compressedContent = gzipSync(content);
    const delta = zstdCompressSync(content, {
      dictionary: baseline,
      params: {
        [constants.ZSTD_c_compressionLevel]: DEFAULT_COMPRESSION_LEVEL,
        [constants.ZSTD_c_windowLog]: getWindowLog(baseline.byteLength, Buffer.byteLength(content)),
      },
    }).toBase64();
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    await writeResourceContentBlob(containerClient, id, baseline.toString());
    await containerClient
      .getBlockBlobClient(getStagingContentBlobName(id))
      .upload(compressedContent, compressedContent.byteLength);
    const hash = createHash("sha256").update(compressedContent).digest("hex");
    const resource = createResourceListItem({ contentHash: createHash("sha256").update(baseline).digest("hex"), id });
    await bench.compare(
      bench("JSON.parse", () => {
        // oxlint-disable-next-line no-restricted-properties -- the floor every save pays, measured bare
        JSON.parse(content);
      }),
      bench("staged", async () => {
        await readStagedResourceContent(id, hash);
      }),
      bench("delta", async () => {
        await readResourceContentDelta(resource, resource.contentHash, delta);
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: byteCount < MAX_RESOURCE_CONTENT_SIZE / 10 ? 10 : 3 },
    );
  });
});
