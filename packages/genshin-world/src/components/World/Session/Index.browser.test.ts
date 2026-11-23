import type { DevRegistry } from "#src/models/dev/DevRegistry";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createSessionDriver } from "#src/components/World/Session/createSessionDriver.fixture";
import { Currency } from "#src/models/inventory/Currency";
import { questSchema } from "#src/models/quest/Quest";
import { QuestId } from "#src/models/quest/QuestId";
import { genshinSaveSchema } from "#src/models/save/GenshinSave";
import { SCRIPTED_FRAME_MS } from "#src/services/dev/constants";
import { createDevRegistry } from "#src/services/dev/createDevRegistry";
import { stepFramesUntil } from "#src/services/dev/stepFramesUntil";
import { EMPTY_CURRENCIES, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { QuestLoaderMap } from "#src/services/quest/QuestLoaderMap";
import { EMPTY_GENSHIN_SAVE, MAX_TRAVELER_NAME_LENGTH } from "#src/services/save/constants";
import { useWorldSessionStore } from "#src/store/session";
import { assert, describe, expect, onTestFinished, test } from "vitest";
import { z } from "zod";

// The three readings a session holds across a save: a quest's step, the defeats the Archive counts and Mora in the
// Wallet
const readHolds = (devRegistry: DevRegistry) => ({
  defeats: devRegistry.run("kills"),
  mora: devRegistry.run(`bag ${Currency.Mora}`),
  questStep: devRegistry.run(`quest ${QuestId.WanderersTrail}`),
});
// The value the HUD's Sheer Cold bar reads, which the session writes from the gauge's value each time it changes
const readSheerColdValue = (): number => {
  const bar = document.querySelector<HTMLElement>(".sheer-cold");
  assert.exists(bar);

  return Number(bar.getAttribute("aria-valuenow"));
};
// Whether the character's state line names the area it stands in, the same reading a console line gives
const checkIsStandingIn = (devRegistry: DevRegistry, area: string): boolean => {
  const state = devRegistry.run("state");

  return state.ok && String(state.value).includes(` place=${area} `);
};

describe("worldSession", () => {
  // A session mounts a whole world and unmounts it, which takes longer than the default timeout on a machine the suite
  // Shares with its other files, so each case gets a minute
  const timeoutMs = 60_000;

  test(
    "a load restores what the save holds",
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
    "a save the schema refuses fails the script",
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
    "a save that fails to settle still unmounts the screen",
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
      // The world's commands leave the registry only once its screen unmounts, so a command still answering here means
      // It did not
      expect(kills).toStrictEqual({ error: "not available here", ok: false, usage: "kills" });
    },
    timeoutMs,
  );

  test(
    "a store the session stops is empty, so the next mount starts from its own save",
    async () => {
      expect.hasAssertions();

      const devRegistry = createDevRegistry();
      const sessionDriver = createSessionDriver(devRegistry);
      onTestFinished(() => sessionDriver.dispose());
      // A save holding one Mora, so a second mount that kept the first session's bag would read it where its own save
      // Has none
      const moraSave: GenshinSave = {
        ...EMPTY_GENSHIN_SAVE,
        wallet: { ...EMPTY_GENSHIN_SAVE.wallet, currencies: { ...EMPTY_CURRENCIES, [Currency.Mora]: 1 } },
      };
      const mounted = await sessionDriver.mount(moraSave);
      const firstMora = readHolds(devRegistry).mora;
      const firstSaved = await sessionDriver.save();
      // Read from the pinia the screen mounted on, as the app's next mount would find the store
      const worldSessionStore = useWorldSessionStore(sessionDriver.pinia);
      const firstStopped = { inventory: worldSessionStore.inventory, wallet: worldSessionStore.wallet };
      const secondMounted = await sessionDriver.mount();
      const secondMora = readHolds(devRegistry).mora;
      const secondSaved = await sessionDriver.save();
      const secondStopped = { inventory: worldSessionStore.inventory, wallet: worldSessionStore.wallet };

      expect(mounted).toStrictEqual({ ok: true });
      expect(firstMora).toStrictEqual({ ok: true, value: 1 });
      expect(firstSaved).toStrictEqual({ ok: true });
      expect(firstStopped).toStrictEqual({ inventory: EMPTY_INVENTORY, wallet: EMPTY_WALLET });
      expect(() => worldSessionStore.language).toThrowErrorMatchingInlineSnapshot(
        `[NotInitializedError: WorldSessionStore is not initialized]`,
      );
      expect(secondMounted).toStrictEqual({ ok: true });
      expect(secondMora).toStrictEqual({ ok: true, value: 0 });
      expect(secondSaved).toStrictEqual({ ok: true });
      expect(secondStopped).toStrictEqual({ inventory: EMPTY_INVENTORY, wallet: EMPTY_WALLET });
    },
    timeoutMs,
  );

  test(
    "write the gauge's value into the HUD bar once the character stands in the subzero climate",
    async () => {
      expect.hasAssertions();

      // The one area the subzero climate covers, which a teleport names and the character's state line reads back
      const CLIMATE_AREA = "Dragonspine";
      // The gauge fills a point a second in the climate, so a second's frames after the landing leave the bar a value
      const SECOND_FRAMES = Math.round(1000 / SCRIPTED_FRAME_MS);
      const devRegistry = createDevRegistry();
      const sessionDriver = createSessionDriver(devRegistry);
      onTestFinished(() => sessionDriver.dispose());
      const mounted = await sessionDriver.mount();
      const teleported = devRegistry.run(`teleport ${CLIMATE_AREA}`);
      const landed = await stepFramesUntil(sessionDriver.frame, () =>
        checkIsStandingIn(devRegistry, CLIMATE_AREA) ? true : undefined,
      );
      const sheerCold = await stepFramesUntil(sessionDriver.frame, readSheerColdValue, SECOND_FRAMES);

      expect(mounted).toStrictEqual({ ok: true });
      expect(teleported).toStrictEqual({ ok: true, value: CLIMATE_AREA });
      expect(landed).toBe(true);
      expect(sheerCold).toBeGreaterThan(0);
    },
    timeoutMs,
  );

  test(
    "a mount over a screen still mounted unmounts that screen, so disposing leaves no command behind",
    async () => {
      expect.hasAssertions();

      const devRegistry = createDevRegistry();
      const sessionDriver = createSessionDriver(devRegistry);
      onTestFinished(() => sessionDriver.dispose());
      const firstMounted = await sessionDriver.mount();
      const secondMounted = await sessionDriver.mount();
      await sessionDriver.dispose();
      // Only the second screen was ever unmounted by the dispose, so the first one's commands answer here if it was
      // Orphaned
      const kills = devRegistry.run("kills");

      expect(firstMounted).toStrictEqual({ ok: true });
      expect(secondMounted).toStrictEqual({ ok: true });
      expect(kills).toStrictEqual({ error: "not available here", ok: false, usage: "kills" });
    },
    timeoutMs,
  );
});
