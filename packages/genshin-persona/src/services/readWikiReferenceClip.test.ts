import type { ClipDecoder } from "#src/models/ClipDecoder";
import type { PcmClip } from "#src/models/PcmClip";

import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { TEST_FILENAME } from "#src/services/constants.test";
import { getWikiFileTitle } from "#src/services/getWikiFileTitle";
import { readWikiFile } from "#src/services/readWikiFile";
import { readWikiFileUrls } from "#src/services/readWikiFileUrls";
import { readWikiReferenceClip } from "#src/services/readWikiReferenceClip";
import { writeStateFile } from "#src/services/writeStateFile";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/readWikiFile"), () => ({ readWikiFile: vi.fn<typeof readWikiFile>() }));
vi.mock(import("#src/services/readWikiFileUrls"), () => ({ readWikiFileUrls: vi.fn<typeof readWikiFileUrls>() }));
vi.mock(import("#src/services/writeStateFile"), () => ({ writeStateFile: vi.fn<typeof writeStateFile>() }));

describe(readWikiReferenceClip, () => {
  const clip: PcmClip = { sampleRate: 1, samples: Float32Array.of(1) };
  const bytes = Uint8Array.of(1);
  const decode = vi.fn<ClipDecoder["decode"]>();
  const decoder: ClipDecoder = { decode, free: vi.fn<ClipDecoder["free"]>() };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readWikiFileUrls).mockResolvedValue(
      new Map([[getWikiFileTitle(TEST_FILENAME, VoiceLanguage.English), TEST_FILENAME]]),
    );
    vi.mocked(readWikiFile).mockResolvedValue(bytes);
  });

  test("keeps the bytes once they decode", async () => {
    expect.hasAssertions();

    decode.mockResolvedValue(clip);

    await expect(
      readWikiReferenceClip(TEST_FILENAME, VoiceLanguage.English, TEST_FILENAME, decoder),
    ).resolves.toStrictEqual(clip);
    expect(writeStateFile).toHaveBeenCalledWith(TEST_FILENAME, bytes);
  });

  test("keeps nothing that will not decode", async () => {
    expect.hasAssertions();

    decode.mockResolvedValue(undefined);

    await expect(
      readWikiReferenceClip(TEST_FILENAME, VoiceLanguage.English, TEST_FILENAME, decoder),
    ).resolves.toBeUndefined();
    expect(writeStateFile).not.toHaveBeenCalled();
  });
});
