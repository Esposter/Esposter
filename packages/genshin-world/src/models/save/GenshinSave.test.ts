import { Currency } from "#src/models/inventory/Currency";
import { genshinSaveSchema } from "#src/models/save/GenshinSave";
import { MAX_ITEM_QUANTITY } from "#src/services/inventory/bagLimits";
import {
  EMPTY_GENSHIN_SAVE,
  MAX_ACHIEVEMENT_COUNT,
  MAX_CHARACTER_COUNT,
  MAX_INVENTORY_ITEM_COUNT,
  MAX_OBJECTIVE_COUNT,
  MAX_QUEST_COUNT,
  MAX_SAVE_ID_LENGTH,
  MAX_UNLOCKED_LANDMARK_COUNT,
} from "#src/services/save/constants";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe("genshinSaveSchema", () => {
  // The ceiling is each collection's cap times its longest entry, so a save with every collection at its cap, each
  // Number at its largest and each instant at its longest, is under it and passes the refine
  test("accepts a save at every cap, each number and instant at its longest", () => {
    expect.hasAssertions();
    const maxNumber = Number.MAX_SAFE_INTEGER;
    const epoch = Temporal.Instant.fromEpochMilliseconds(0);
    const maxInstant = epoch.add({ nanoseconds: 999_999_999 }).toString();
    const save = {
      achievements: Object.fromEntries(
        Array.from({ length: MAX_ACHIEVEMENT_COUNT }, (_value, index) => [
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          { count: maxNumber, finishedAt: maxInstant },
        ]),
      ),
      adventureExp: maxNumber,
      companionshipExp: Object.fromEntries(
        Array.from({ length: MAX_CHARACTER_COUNT }, (_value, index) => [
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          maxNumber,
        ]),
      ),
      inventory: {
        items: Array.from({ length: MAX_INVENTORY_ITEM_COUNT }, (_value, index) => ({
          id: maxNumber - index,
          itemId: maxNumber - index,
          level: maxNumber,
          quantity: MAX_ITEM_QUANTITY,
        })),
        nextId: maxNumber,
      },
      quests: Object.fromEntries(
        Array.from({ length: MAX_QUEST_COUNT }, (_value, index) => [
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          { objectiveCounts: Array.from({ length: MAX_OBJECTIVE_COUNT }, () => maxNumber), stepIndex: maxNumber },
        ]),
      ),
      reputation: { exp: maxNumber, level: maxNumber },
      unlockedLandmarks: Array.from({ length: MAX_UNLOCKED_LANDMARK_COUNT }, (_value, index) =>
        String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
      ),
      wallet: {
        currencies: Object.fromEntries(Object.values(Currency).map((currency) => [currency, maxNumber])),
        originalResinChangedAt: maxInstant,
        primogemResinRefillCount: maxNumber,
        primogemResinRefillDay: epoch.toZonedDateTimeISO("UTC").toPlainDate().toString(),
      },
      wishPity: Object.fromEntries(
        Object.values(BannerKind).map((bannerKind) => [
          bannerKind,
          {
            chartedWeaponId: maxNumber,
            fatePoints: maxNumber,
            fiveStarCount: maxNumber,
            fourStarCount: maxNumber,
            isFiveStarGuaranteed: false,
            isFourStarGuaranteed: false,
            lossCount: maxNumber,
            wishCount: maxNumber,
          },
        ]),
      ),
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(true);
  });

  // A slice a save predates is refused rather than defaulted: a stored save is backfilled to the shape, so a default
  // Would only hide a save nobody brought to it
  // A slice a save predates is refused rather than defaulted: a stored save is backfilled to the shape, so a default
  // Would only hide a save nobody brought to it
  test("refuses a save written before the slices were added", () => {
    expect.hasAssertions();
    const predatingSave = {
      quests: EMPTY_GENSHIN_SAVE.quests,
      unlockedLandmarks: EMPTY_GENSHIN_SAVE.unlockedLandmarks,
      wallet: EMPTY_GENSHIN_SAVE.wallet,
    };

    expect(genshinSaveSchema.safeParse(predatingSave).success).toBe(false);
  });
});
