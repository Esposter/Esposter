import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";

import { CHARACTER_MODEL_PATH, CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { planCharacterPackDownload } from "#src/services/character/planCharacterPackDownload";
import { describe, expect, test } from "vitest";

describe(planCharacterPackDownload, () => {
  const gameDataBaseUrl = "http://a.test";
  const sha256 = "0".repeat(64);
  const republishedSha256 = "1".repeat(64);
  const modelUrl = "http://a.test/characterPacks/1/model.pmx?v=0000000000000000";
  const termsUrl = "http://a.test/characterPacks/1/terms.txt?v=0000000000000000";
  const republishedModelUrl = "http://a.test/characterPacks/1/model.pmx?v=1111111111111111";
  const index: CharacterPackIndex = {
    avatars: [
      {
        avatarId: 1,
        files: [
          { bytes: 1, path: CHARACTER_MODEL_PATH, sha256 },
          { bytes: 2, path: CHARACTER_TERMS_PATH, sha256 },
        ],
        name: "a",
      },
    ],
  };

  test("First visit downloads every file", () => {
    expect.hasAssertions();

    const plan = planCharacterPackDownload(index, gameDataBaseUrl, new Set());

    expect(plan).toStrictEqual({
      files: [
        { avatarId: 1, bytes: 1, path: CHARACTER_MODEL_PATH, url: modelUrl },
        { avatarId: 1, bytes: 2, path: CHARACTER_TERMS_PATH, url: termsUrl },
      ],
      pendingBytes: 3,
    });
  });

  test("Returning visit downloads nothing", () => {
    expect.hasAssertions();

    const plan = planCharacterPackDownload(index, gameDataBaseUrl, new Set([modelUrl, termsUrl]));

    expect(plan).toStrictEqual({ files: [], pendingBytes: 0 });
  });

  test("Republished file is fetched again", () => {
    expect.hasAssertions();

    const republishedIndex: CharacterPackIndex = {
      avatars: [
        {
          avatarId: 1,
          files: [
            { bytes: 1, path: CHARACTER_MODEL_PATH, sha256: republishedSha256 },
            { bytes: 2, path: CHARACTER_TERMS_PATH, sha256 },
          ],
          name: "a",
        },
      ],
    };

    const plan = planCharacterPackDownload(republishedIndex, gameDataBaseUrl, new Set([modelUrl, termsUrl]));

    expect(plan).toStrictEqual({
      files: [{ avatarId: 1, bytes: 1, path: CHARACTER_MODEL_PATH, url: republishedModelUrl }],
      pendingBytes: 1,
    });
  });
});
