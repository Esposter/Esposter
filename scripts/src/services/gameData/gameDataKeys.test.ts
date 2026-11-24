import {
  GAME_DATA_KEYS_PATH,
  GAME_DATA_LOCK_FILE_NAME,
  GAME_DATA_LOCK_PATH,
  GAME_DATA_PRODUCT_NAME,
} from "#src/services/gameData/constants";
import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { formatGeneratedSource } from "#src/services/shared/formatGeneratedSource";
import { getHostedAssetLockKeysSource } from "hosted-assets";
import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe(getHostedAssetLockKeysSource, () => {
  // The committed keys are what the renderer writes for the committed lock, so a key added to the lock without a
  // Regenerate fails here
  test("the committed keys file is the renderer's output for the committed lock", async () => {
    expect.hasAssertions();

    const lock = await readHostedAssetLock(GAME_DATA_LOCK_PATH);

    await expect(readFile(GAME_DATA_KEYS_PATH, "utf8")).resolves.toBe(
      await formatGeneratedSource(
        GAME_DATA_KEYS_PATH,
        getHostedAssetLockKeysSource(GAME_DATA_PRODUCT_NAME, GAME_DATA_LOCK_FILE_NAME, lock),
      ),
    );
  });
});
