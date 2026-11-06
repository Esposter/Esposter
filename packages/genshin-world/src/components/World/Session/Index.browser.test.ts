import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createSessionDriver } from "#src/components/World/Session/createSessionDriver.fixture";
import { Currency } from "#src/models/inventory/Currency";
import type { DevRegistry } from "#src/models/dev/DevRegistry";
import { genshinSaveSchema } from "#src/models/save/GenshinSave";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import { questSchema } from "#src/models/quest/Quest";
import { QuestId } from "#src/models/quest/QuestId";
import { createDevRegistry } from "#src/services/dev/createDevRegistry";
import { QuestLoaderMap } from "#src/services/quest/QuestLoaderMap";
import { EMPTY_CURRENCIES } from "#src/services/inventory/constants";
import { EMPTY_GENSHIN_SAVE, MAX_TRAVELER_NAME_LENGTH } from "#src/services/save/constants";
import { assert, describe, expect, onTestFinished, test } from "vitest";
import { z } from "zod";

describe("worldSession", () => {
  // A session's world is drawn in a headless browser slower than on a screen, and each scripted frame waits on one
  const timeoutMs = 240_000;

  // The three readings a session holds across a save: a quest's step, the defeats the Archive counts and Mora in the wallet
  const readHolds = (devRegistry: DevRegistry) => ({
    defeats: devRegistry.run("kills"),
    mora: devRegistry.run(`bag ${Currency.Mora}`),
    questStep: devRegistry.run(`quest ${QuestId.WanderersTrail}`),
  });

  test(
    "A load restores what the save holds",
    async () => {
      expect.hasAssertions();

      const devRegistry = createDevRegistry();
      const sessionDriver = createSessionDriver(devRegistry);
      onTestFinished(() => sessionDriver.dispose());
      // A save that holds one step of Wanderer's Trail, one defeat and one Mora, so each reading is off its empty value
      const seededSave: GenshinSave = {
        ...EMPTY_GENSHIN_SAVE,
        archive: { ...EMPTY_GENSHIN_SAVE.archive, kills: { "-1": 1 } },
        quests: { [QuestId.WanderersTrail]: { objectiveCounts: [], stepIndex: 1 } },
        wallet: { ...EMPTY_GENSHIN_SAVE.wallet, currencies: { ...EMPTY_CURRENCIES, [Currency.Mora]: 1 } },
      };
      // The quest's own record, read as the world reads it, so the total the quest reading gives is the record's
      const quest = questSchema.parse(await QuestLoaderMap[QuestId.WanderersTrail](GAME_DATA_LOCAL_BASE_URL));
      const mounted = await sessionDriver.mount(seededSave);
      const readingsBeforeSave = readHolds(devRegistry);
      const saved = await sessionDriver.save();
      const loaded = await sessionDriver.load();
      const readingsAfterLoad = readHolds(devRegistry);

      expect(mounted).toStrictEqual({ ok: true });
      expect(readingsBeforeSave).toStrictEqual({
        defeats: { ok: true, value: 1 },
        mora: { ok: true, value: 1 },
        questStep: { ok: true, value: `step 2 of ${quest.steps.length}` },
      });
      expect(saved).toStrictEqual({ ok: true });
      expect(loaded).toStrictEqual({ ok: true });
      expect(readingsAfterLoad).toStrictEqual(readingsBeforeSave);
    },
    timeoutMs,
  );

  test(
    "A save the schema refuses fails the script",
    async () => {
      expect.hasAssertions();

      const devRegistry = createDevRegistry();
      const sessionDriver = createSessionDriver(devRegistry);
      onTestFinished(() => sessionDriver.dispose());
      // A traveler's name one character past the save's bound, which the world carries through as it was saved
      const refusedSave: GenshinSave = {
        ...EMPTY_GENSHIN_SAVE,
        travelerName: "a".repeat(MAX_TRAVELER_NAME_LENGTH + 1),
      };
      const mounted = await sessionDriver.mount(refusedSave);
      const saved = await sessionDriver.save();
      const refusal = genshinSaveSchema.safeParse(refusedSave);

      assert.exists(refusal.error);
      expect(mounted).toStrictEqual({ ok: true });
      expect(saved).toStrictEqual({ error: z.prettifyError(refusal.error), ok: false });
    },
    timeoutMs,
  );

  test(
    "A save that fails to settle still unmounts the screen",
    async () => {
      expect.hasAssertions();

      const devRegistry = createDevRegistry();
      // A registry that refuses the settle's read, so the save fails before it takes the world's save
      const refusingRegistry: DevRegistry = {
        ...devRegistry,
        run: (line) => (line === "settled" ? { error: " ", ok: false, usage: "" } : devRegistry.run(line)),
      };
      const sessionDriver = createSessionDriver(refusingRegistry);
      onTestFinished(() => sessionDriver.dispose());
      const mounted = await sessionDriver.mount();
      const saved = await sessionDriver.save();
      const kills = devRegistry.run("kills");

      expect(mounted).toStrictEqual({ ok: true });
      expect(saved).toStrictEqual({ error: " ", ok: false });
      // The world's commands leave the registry only once its screen unmounts, so a command still answering here means it did not
      expect(kills).toStrictEqual({ error: "not available here", ok: false, usage: "kills" });
    },
    timeoutMs,
  );
});
