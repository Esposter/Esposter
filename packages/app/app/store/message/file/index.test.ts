// @vitest-environment nuxt
import type { Router } from "vue-router";

import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useDataStore } from "@/store/message/data";
import { useDownloadFileStore } from "@/store/message/file";
import { createMessageEntity, MessageType, READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";
import { MAX_READ_LIMIT, takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(useDownloadFileStore, () => {
  const server = setupMswTrpc();
  let router: Router;
  const roomId = crypto.randomUUID();
  const fileId = crypto.randomUUID();
  const filename = "a";
  const staleUrl = "https://sas.url/stale";
  const freshUrl = "https://sas.url/fresh";

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = roomId;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // A page read only mints urls for files it does not already hold, so nothing else re-mints a cached one.
  // Without this sweep a room left open past READ_SAS_DURATION_MS renders every attachment broken until
  // Reload — the failure the expiry check alone was assumed, wrongly, to cover.
  test("re-mints a cached url that has aged into the refresh margin", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.message.generateDownloadFileSasUrls.query(() => [freshUrl]));
    vi.useFakeTimers();
    const dataStore = useDataStore();
    const downloadFileStore = useDownloadFileStore();
    const { fileUrlMap } = storeToRefs(downloadFileStore);
    const { items } = storeToRefs(dataStore);
    items.value.push(
      createMessageEntity({
        files: [{ filename, hasThumbnail: false, id: fileId, mimetype: "text/plain", size: 1 }],
        message: filename,
        roomId,
        type: MessageType.Message,
        userId: crypto.randomUUID(),
      }),
    );
    // Inside the margin, so the very next sweep must replace it rather than wait for it to actually die.
    fileUrlMap.value.set(fileId, { expiresAt: Date.now() + READ_SAS_REFRESH_INTERVAL_MS / 2, url: staleUrl });
    await vi.advanceTimersByTimeAsync(READ_SAS_REFRESH_INTERVAL_MS);
    // The sweep is fire-and-forget, so drain it rather than polling for its effect.
    await waitForSynchronizedFunctions();

    expect(fileUrlMap.value.get(fileId)?.url).toBe(freshUrl);
  });

  // The query caps `files` at MAX_READ_LIMIT, and the long-open room this sweep exists for is exactly the one
  // That scrolls past that cap — sending them all in one input would reject every tick from then on
  test("re-mints in batches when more urls expire than one query accepts", async () => {
    expect.hasAssertions();

    const generateDownloadFileSasUrls = vi.fn<(options: { input: { files: unknown[] } }) => string[]>(({ input }) =>
      input.files.map(() => freshUrl),
    );
    server.use(trpcMsw.message.generateDownloadFileSasUrls.query(generateDownloadFileSasUrls));
    vi.useFakeTimers();
    const dataStore = useDataStore();
    const downloadFileStore = useDownloadFileStore();
    const { fileUrlMap } = storeToRefs(downloadFileStore);
    const { items } = storeToRefs(dataStore);
    const files = Array.from({ length: MAX_READ_LIMIT + 1 }, () => ({
      filename,
      hasThumbnail: false,
      id: crypto.randomUUID(),
      mimetype: "text/plain",
      size: 1,
    }));
    items.value.push(
      createMessageEntity({ files, message: filename, roomId, type: MessageType.Message, userId: crypto.randomUUID() }),
    );
    for (const { id } of files)
      fileUrlMap.value.set(id, { expiresAt: Date.now() + READ_SAS_REFRESH_INTERVAL_MS / 2, url: staleUrl });
    await vi.advanceTimersByTimeAsync(READ_SAS_REFRESH_INTERVAL_MS);
    await waitForSynchronizedFunctions();

    expect(generateDownloadFileSasUrls).toHaveBeenCalledTimes(2);

    expect(fileUrlMap.value.get(takeOne(files, MAX_READ_LIMIT).id)?.url).toBe(freshUrl);
  });

  test("issues no query while every cached url is comfortably valid", async () => {
    expect.hasAssertions();

    const generateDownloadFileSasUrls = vi.fn<() => string[]>(() => [freshUrl]);
    server.use(trpcMsw.message.generateDownloadFileSasUrls.query(generateDownloadFileSasUrls));
    vi.useFakeTimers();
    const downloadFileStore = useDownloadFileStore();
    const { fileUrlMap } = storeToRefs(downloadFileStore);
    fileUrlMap.value.set(fileId, { expiresAt: Date.now() + READ_SAS_REFRESH_INTERVAL_MS * 10, url: staleUrl });
    await vi.advanceTimersByTimeAsync(READ_SAS_REFRESH_INTERVAL_MS);

    expect(generateDownloadFileSasUrls).not.toHaveBeenCalled();
  });
});
