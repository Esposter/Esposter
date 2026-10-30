import type { readGenshinDb } from "genshin-persona/src/services/readGenshinDb.ts";

import { GENSHIN_TEXT_GENERATED_DIRECTORY } from "#src/services/genshinText/constants";
import { readManualTextMap } from "#src/services/genshinText/readManualTextMap";
import { readSdkText } from "#src/services/genshinText/readSdkText";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { readVoiceLineFetters } from "#src/services/genshinText/readVoiceLineFetters";
import { writeGameText } from "#src/services/genshinText/writeGameText";
import { GameLanguage, GameLanguages, GameTextKeys } from "genshin-text";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinText/getGameTextHash"), () => ({ getGameTextHash: () => "1" }));
vi.mock(import("#src/services/genshinText/readManualTextMap"));
vi.mock(import("#src/services/genshinText/readSdkText"));
vi.mock(import("#src/services/genshinText/readTextMap"));
vi.mock(import("#src/services/genshinText/readVoiceLineFetters"));
vi.mock(import("genshin-persona/src/services/readGenshinDb.ts"), () => ({
  readGenshinDb: (() => ({ characters: () => [], voiceovers: () => undefined })) as unknown as typeof readGenshinDb,
}));
vi.mock(import("node:fs"), async (importOriginal) => ({
  ...(await importOriginal()),
  mkdirSync: vi.fn<typeof mkdirSync>(),
  rmSync: vi.fn<typeof rmSync>(),
  writeFileSync: vi.fn<typeof writeFileSync>(),
}));

describe(writeGameText, () => {
  beforeEach(() => {
    vi.mocked(readManualTextMap).mockReturnValue(new Map());
    vi.mocked(readSdkText).mockReturnValue(new Map());
    vi.mocked(readTextMap).mockReturnValue(new Map([["1", "text"]]));
    vi.mocked(readVoiceLineFetters).mockReturnValue(new Map());
  });

  test("reads every language and writes nothing on a dry run", async () => {
    expect.hasAssertions();

    const notes = await writeGameText({ isDryRun: true });

    const languagesRead = vi.mocked(readTextMap).mock.calls.map(([language]) => language);

    expect(languagesRead.toSorted()).toStrictEqual(GameLanguages.toSorted());
    expect(notes).toStrictEqual([
      `dry run: ${GameTextKeys.length} strings in ${GameLanguages.length} languages read, and nothing written`,
    ]);
    expect(rmSync).not.toHaveBeenCalled();
    expect(mkdirSync).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  test("writes the generated text on a run that is not a dry run", async () => {
    expect.hasAssertions();

    await writeGameText({ isDryRun: false });

    expect(writeFileSync).toHaveBeenCalledWith(
      join(GENSHIN_TEXT_GENERATED_DIRECTORY, "text", `${GameLanguage.English}.json`),
      expect.anything(),
    );
    expect(rmSync).toHaveBeenCalledWith(join(GENSHIN_TEXT_GENERATED_DIRECTORY, "text"), {
      force: true,
      recursive: true,
    });
  });
});
