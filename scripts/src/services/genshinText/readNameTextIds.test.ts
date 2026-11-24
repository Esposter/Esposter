import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { readNameTextIds } from "#src/services/genshinText/readNameTextIds";
import { GameLanguage } from "genshin-text";
import { GameDataset } from "genshin-world";
import { describe, expect, test } from "vitest";

// The guard the writer's own discovery feeds: a record republished without a names republish cites a text id the
// English name chunk does not hold, and this fails on it. The cited ids and the chunk are both read from the lock on
// Disk, so the discovery is the writer's, never a copy of it. A cold machine downloads each published record once, past
// A default timeout
describe(readNameTextIds, () => {
  const RECORD_DOWNLOAD_TIMEOUT_MS = Temporal.Duration.from({ minutes: 2 }).total("milliseconds");

  test(
    "the English name chunk holds every nameTextId the world cites",
    async () => {
      expect.hasAssertions();

      const textIds = await readNameTextIds();
      const names = await readPublishedGameData<Readonly<Record<string, string>>>(
        `${GameDataset.NameText}/${GameLanguage.English}`,
      );

      expect(textIds.filter((textId) => names[textId] === undefined)).toStrictEqual([]);
    },
    RECORD_DOWNLOAD_TIMEOUT_MS,
  );
});
