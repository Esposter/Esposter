import type { ClipDecoder } from "#src/models/ClipDecoder";
import type { PcmClip } from "#src/models/PcmClip";

import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { TEST_FILENAME } from "#src/services/constants.test";
import { cutReferenceClip } from "#src/services/cutReferenceClip";
import { getReferencePath } from "#src/services/getReferencePath";
import { readReferenceClip } from "#src/services/readReferenceClip";
import { readWikiReferenceClip } from "#src/services/readWikiReferenceClip";
import { resampleClip } from "#src/services/resampleClip";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/cutReferenceClip"), () => ({ cutReferenceClip: vi.fn<typeof cutReferenceClip>() }));
vi.mock(import("#src/services/getReferencePath"), () => ({ getReferencePath: vi.fn<typeof getReferencePath>() }));
vi.mock(import("#src/services/readWikiReferenceClip"), () => ({
  readWikiReferenceClip: vi.fn<typeof readWikiReferenceClip>(),
}));
vi.mock(import("#src/services/resampleClip"), () => ({ resampleClip: vi.fn<typeof resampleClip>() }));

describe(readReferenceClip, () => {
  const clip: PcmClip = { sampleRate: 1, samples: Float32Array.of(1) };
  let directory = "";
  let decode = vi.fn<ClipDecoder["decode"]>();
  let decoder: ClipDecoder = { decode, free: vi.fn<ClipDecoder["free"]>() };

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "genshin-persona-"));
    decode = vi.fn<ClipDecoder["decode"]>();
    decoder = { decode, free: vi.fn<ClipDecoder["free"]>() };
    vi.mocked(getReferencePath).mockReturnValue(join(directory, TEST_FILENAME));
    vi.mocked(cutReferenceClip).mockImplementation((_name, ownClip) => ownClip);
    vi.mocked(resampleClip).mockImplementation((ownClip) => ownClip);
    vi.mocked(readWikiReferenceClip).mockResolvedValue(clip);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
    vi.clearAllMocks();
  });

  test("a cached file that will not decode is fetched again", async () => {
    expect.hasAssertions();

    writeFileSync(join(directory, TEST_FILENAME), "");
    decode.mockResolvedValue(undefined);

    await expect(
      readReferenceClip(TEST_FILENAME, TEST_FILENAME, VoiceLanguage.English, decoder),
    ).resolves.toMatchObject({ samples: clip.samples });
    expect(readWikiReferenceClip).toHaveBeenCalledTimes(1);
  });

  test("a cached file that decodes is read without a fetch", async () => {
    expect.hasAssertions();

    writeFileSync(join(directory, TEST_FILENAME), "");
    decode.mockResolvedValue(clip);

    await expect(
      readReferenceClip(TEST_FILENAME, TEST_FILENAME, VoiceLanguage.English, decoder),
    ).resolves.toMatchObject({ samples: clip.samples });
    expect(readWikiReferenceClip).not.toHaveBeenCalled();
  });
});
