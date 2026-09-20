import { readGeneratedJson } from "#src/services/voiceMatch/readGeneratedJson";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(readGeneratedJson, () => {
  test("is empty before the stage has ever run", () => {
    expect.hasAssertions();

    expect(readGeneratedJson(join(tmpdir(), "esposter-voice-match-never-run"))).toStrictEqual([]);
  });
});
