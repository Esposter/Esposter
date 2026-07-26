// @vitest-environment nuxt
import type { Router } from "vue-router";

import { useDataStore } from "@/store/message/data";
import { useDownloadFileStore } from "@/store/message/file";
import { createMessageEntity, MessageType, READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { generateDownloadFileSasUrlsQueryMock, generateDownloadThumbnailSasUrlsQueryMock } = vi.hoisted(() => ({
  generateDownloadFileSasUrlsQueryMock: vi.fn(),
  generateDownloadThumbnailSasUrlsQueryMock: vi.fn(),
}));

// The tRPC client the plugin builds is a real HTTP client the test env cannot serve.
vi.mock(import("trpc-nuxt/client"), async (importOriginal) => ({
  ...(await importOriginal()),
  createTRPCNuxtClient: () => ({
    message: {
      generateDownloadFileSasUrls: { query: generateDownloadFileSasUrlsQueryMock },
      generateDownloadThumbnailSasUrls: { query: generateDownloadThumbnailSasUrlsQueryMock },
    },
  }),
}));

describe(useDownloadFileStore, () => {
  let router: Router;
  const roomId = crypto.randomUUID();
  const fileId = crypto.randomUUID();
  const filename = "filename.txt";
  const staleUrl = "https://sas.url/stale";
  const freshUrl = "https://sas.url/fresh";

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = roomId;
    // Hoisted mocks outlive restoreAllMocks, so reset their call history alongside their implementation.
    generateDownloadFileSasUrlsQueryMock.mockReset().mockResolvedValue([freshUrl]);
    generateDownloadThumbnailSasUrlsQueryMock.mockReset().mockResolvedValue([]);
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

    const dataStore = useDataStore();
    const downloadFileStore = useDownloadFileStore();
    const { fileUrlMap } = storeToRefs(downloadFileStore);
    const { items } = storeToRefs(dataStore);
    items.value.push(
      createMessageEntity({
        files: [{ filename, id: fileId, mimetype: "text/plain", size: 1 }],
        message: filename,
        roomId,
        type: MessageType.Message,
        userId: crypto.randomUUID(),
      }),
    );
    // Inside the margin, so the very next sweep must replace it rather than wait for it to actually die.
    fileUrlMap.value.set(fileId, { expiresAt: Date.now() + READ_SAS_REFRESH_INTERVAL_MS / 2, url: staleUrl });
    await vi.advanceTimersByTimeAsync(READ_SAS_REFRESH_INTERVAL_MS);

    expect(fileUrlMap.value.get(fileId)?.url).toBe(freshUrl);
  });

  test("issues no query while every cached url is comfortably valid", async () => {
    expect.hasAssertions();

    const downloadFileStore = useDownloadFileStore();
    const { fileUrlMap } = storeToRefs(downloadFileStore);
    fileUrlMap.value.set(fileId, { expiresAt: Date.now() + READ_SAS_REFRESH_INTERVAL_MS * 10, url: staleUrl });
    await vi.advanceTimersByTimeAsync(READ_SAS_REFRESH_INTERVAL_MS);

    expect(generateDownloadFileSasUrlsQueryMock).not.toHaveBeenCalled();
  });
});
